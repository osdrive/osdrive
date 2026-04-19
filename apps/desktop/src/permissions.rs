use std::{
    fs,
    io,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
struct SavedBookmark {
    path: PathBuf,
    bookmark_base64: String,
}

pub(crate) fn initial_directory() -> PathBuf {
    platform::initial_directory()
}

pub(crate) fn ensure_access_for_path(path: &Path) -> Result<(), String> {
    platform::ensure_access_for_path(path)
}

pub(crate) fn prompt_for_folder_access_message() -> String {
    platform::prompt_for_folder_access_message()
}

pub(crate) fn access_status_message() -> String {
    platform::access_status_message()
}

pub(crate) fn open_full_disk_access_settings_message() -> String {
    platform::open_full_disk_access_settings_message()
}

pub(crate) fn with_access<T>(path: &Path, f: impl FnOnce() -> io::Result<T>) -> io::Result<T> {
    platform::with_access(path, f)
}

pub(crate) fn open_path(path: &Path) -> Result<(), String> {
    ensure_access_for_path(path)?;
    with_access(path, || opener::open(path).map_err(io::Error::other)).map_err(|error| {
        format!("Couldn't open {}: {error}", path.display())
    })
}

#[cfg(target_os = "macos")]
mod platform {
    use std::{
        io,
        path::{Path, PathBuf},
    };

    use objc2::{AnyThread, MainThreadMarker, rc::Retained};
    use objc2_app_kit::{NSApplication, NSModalResponseOK, NSOpenPanel};
    use objc2_foundation::{
        NSData, NSDataBase64DecodingOptions, NSDataBase64EncodingOptions, NSString, NSURL,
        NSURLBookmarkCreationOptions, NSURLBookmarkResolutionOptions,
    };

    use super::{SavedBookmark, fs};

    const BOOKMARKS_FILE_NAME: &str = "bookmarks.json";
    const FULL_DISK_ACCESS_SETTINGS_URL: &str =
        "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles";

    pub(super) fn initial_directory() -> PathBuf {
        match load_bookmarks() {
            Ok(bookmarks) => bookmarks
                .into_iter()
                .max_by_key(|bookmark| bookmark.path.components().count())
                .map(|bookmark| bookmark.path)
                .unwrap_or_else(default_directory),
            Err(_) => default_directory(),
        }
    }

    pub(super) fn ensure_access_for_path(path: &Path) -> Result<(), String> {
        let requested_path = requested_root(path);
        if has_existing_access(&requested_path)? {
            return Ok(());
        }

        let Some(bookmark) = prompt_for_folder_access(&requested_path)? else {
            return Err(format!(
                "Access was not granted for {}.",
                requested_path.display()
            ));
        };

        upsert_bookmark(bookmark)?;

        if has_existing_access(&requested_path)? {
            Ok(())
        } else {
            Err(format!(
                "The selected folder does not cover {}.",
                requested_path.display()
            ))
        }
    }

    pub(super) fn prompt_for_folder_access_message() -> String {
        match prompt_for_folder_access(&default_directory()) {
            Ok(Some(bookmark)) => match upsert_bookmark(bookmark.clone()) {
                Ok(()) => format!("Granted access to {}.", bookmark.path.display()),
                Err(error) => format!("Couldn't save folder access: {error}"),
            },
            Ok(None) => "Folder access request was cancelled.".to_string(),
            Err(error) => format!("Couldn't request folder access: {error}"),
        }
    }

    pub(super) fn access_status_message() -> String {
        match load_bookmarks() {
            Ok(bookmarks) if bookmarks.is_empty() => {
                "No folders have been granted yet. OSDrive will ask when you open one.".to_string()
            }
            Ok(bookmarks) => format!(
                "Granted folders: {}",
                bookmarks
                    .iter()
                    .map(|bookmark| bookmark.path.display().to_string())
                    .collect::<Vec<_>>()
                    .join(", ")
            ),
            Err(error) => format!("Couldn't read saved folder access: {error}"),
        }
    }

    pub(super) fn open_full_disk_access_settings_message() -> String {
        match opener::open(FULL_DISK_ACCESS_SETTINGS_URL) {
            Ok(()) => "Opened System Settings for Full Disk Access. This is optional and broader than folder-by-folder access.".to_string(),
            Err(error) => format!("Couldn't open Full Disk Access settings: {error}"),
        }
    }

    pub(super) fn with_access<T>(path: &Path, f: impl FnOnce() -> io::Result<T>) -> io::Result<T> {
        let Some(bookmark) = best_matching_bookmark(path)? else {
            return f();
        };

        let access = ScopedAccess::start(&bookmark)
            .map_err(|error| io::Error::new(io::ErrorKind::PermissionDenied, error))?;
        let result = f();
        drop(access);
        result
    }

    fn requested_root(path: &Path) -> PathBuf {
        if path.is_dir() {
            path.to_path_buf()
        } else {
            path.parent().unwrap_or(path).to_path_buf()
        }
    }

    fn has_existing_access(path: &Path) -> Result<bool, String> {
        Ok(best_matching_bookmark(path)
            .map_err(|error| error.to_string())?
            .is_some())
    }

    fn best_matching_bookmark(path: &Path) -> io::Result<Option<SavedBookmark>> {
        let normalized = normalize_path(path);
        let protected_root = protected_root_for_path(&normalized);
        Ok(load_bookmarks()?
            .into_iter()
            .filter_map(|bookmark| {
                let bookmark_path = normalize_path(&bookmark.path);
                if !normalized.starts_with(&bookmark_path) {
                    return None;
                }

                if let Some(protected_root) = protected_root.as_ref()
                    && !bookmark_path.starts_with(protected_root)
                {
                    return None;
                }

                Some((bookmark_path.components().count(), bookmark))
            })
            .max_by_key(|(depth, _)| *depth)
            .map(|(_, bookmark)| bookmark))
    }

    fn prompt_for_folder_access(requested_path: &Path) -> Result<Option<SavedBookmark>, String> {
        let mtm = MainThreadMarker::new()
            .ok_or_else(|| "Folder access must be requested from the UI thread.".to_string())?;

        let default_path = nearest_existing_directory(requested_path);
        let default_path_string = NSString::from_str(default_path.to_string_lossy().as_ref());
        let requested_path_string = requested_path.display().to_string();

        let app = NSApplication::sharedApplication(mtm);
        app.activate();

        let panel = NSOpenPanel::openPanel(mtm);
        panel.setCanChooseDirectories(true);
        panel.setCanChooseFiles(false);
        panel.setAllowsMultipleSelection(false);
        panel.setCanCreateDirectories(true);
        panel.setTitle(Some(&NSString::from_str("Grant Folder Access")));
        panel.setPrompt(Some(&NSString::from_str("Grant Access")));
        panel.setMessage(Some(&NSString::from_str(&format!(
            "Choose a folder that covers {}.",
            requested_path_string
        ))));

        let directory_url = NSURL::fileURLWithPath_isDirectory(&default_path_string, true);
        panel.setDirectoryURL(Some(&directory_url));

        if panel.runModal() != NSModalResponseOK {
            return Ok(None);
        }

        let urls = panel.URLs();
        let Some(selected_url) = urls.iter().next() else {
            return Ok(None);
        };
        let bookmark = make_bookmark(&selected_url).map_err(|error| format!("{error:?}"))?;
        Ok(Some(bookmark))
    }

    fn make_bookmark(url: &NSURL) -> Result<SavedBookmark, Retained<objc2_foundation::NSError>> {
        let path = url
            .path()
            .map(|value| PathBuf::from(value.to_string()))
            .map(|path| normalize_path(&path))
            .unwrap_or_else(default_directory);
        let bookmark = url.bookmarkDataWithOptions_includingResourceValuesForKeys_relativeToURL_error(
            NSURLBookmarkCreationOptions::WithSecurityScope,
            None,
            None,
        )?;

        Ok(SavedBookmark {
            path,
            bookmark_base64: bookmark
                .base64EncodedStringWithOptions(NSDataBase64EncodingOptions(0))
                .to_string(),
        })
    }

    fn upsert_bookmark(bookmark: SavedBookmark) -> Result<(), String> {
        let mut bookmarks = load_bookmarks().map_err(|error| error.to_string())?;
        bookmarks.retain(|existing| existing.path != bookmark.path);
        bookmarks.push(bookmark);
        save_bookmarks(&bookmarks).map_err(|error| error.to_string())
    }

    fn load_bookmarks() -> io::Result<Vec<SavedBookmark>> {
        let file = bookmarks_file_path()?;
        if !file.exists() {
            return Ok(Vec::new());
        }

        let data = fs::read(&file)?;
        serde_json::from_slice(&data).map_err(io::Error::other)
    }

    fn save_bookmarks(bookmarks: &[SavedBookmark]) -> io::Result<()> {
        let path = bookmarks_file_path()?;
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }

        let payload = serde_json::to_vec_pretty(bookmarks).map_err(io::Error::other)?;
        fs::write(path, payload)
    }

    fn bookmarks_file_path() -> io::Result<PathBuf> {
        let home = std::env::var_os("HOME")
            .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "HOME is not set"))?;
        Ok(PathBuf::from(home)
            .join("Library")
            .join("Application Support")
            .join("OSDrive")
            .join(BOOKMARKS_FILE_NAME))
    }

    fn default_directory() -> PathBuf {
        std::env::var_os("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("/"))
    }

    fn nearest_existing_directory(path: &Path) -> PathBuf {
        for candidate in path.ancestors() {
            if candidate.is_dir() {
                return candidate.to_path_buf();
            }
        }

        default_directory()
    }

    fn normalize_path(path: &Path) -> PathBuf {
        path.canonicalize().unwrap_or_else(|_| path.to_path_buf())
    }

    fn protected_root_for_path(path: &Path) -> Option<PathBuf> {
        let home = normalize_path(&default_directory());

        ["Desktop", "Documents", "Downloads"]
            .into_iter()
            .map(|name| home.join(name))
            .find(|protected_root| path == protected_root || path.starts_with(protected_root))
    }

    struct ScopedAccess {
        url: Retained<NSURL>,
    }

    impl ScopedAccess {
        fn start(bookmark: &SavedBookmark) -> Result<Self, String> {
            let bookmark_string = NSString::from_str(&bookmark.bookmark_base64);
            let bookmark_data = NSData::initWithBase64EncodedString_options(
                NSData::alloc(),
                &bookmark_string,
                NSDataBase64DecodingOptions::IgnoreUnknownCharacters,
            )
            .ok_or_else(|| format!("Invalid bookmark for {}.", bookmark.path.display()))?;

            let mut is_stale = objc2::runtime::Bool::NO;
            let url = unsafe {
                NSURL::URLByResolvingBookmarkData_options_relativeToURL_bookmarkDataIsStale_error(
                    &bookmark_data,
                    NSURLBookmarkResolutionOptions::WithSecurityScope,
                    None,
                    &mut is_stale,
                )
            }
            .map_err(|error| format!("{error:?}"))?;

            let started = unsafe { url.startAccessingSecurityScopedResource() };
            if !started {
                return Err(format!(
                    "macOS denied access to {}.",
                    bookmark.path.display()
                ));
            }

            Ok(Self { url })
        }
    }

    impl Drop for ScopedAccess {
        fn drop(&mut self) {
            unsafe {
                self.url.stopAccessingSecurityScopedResource();
            }
        }
    }
}

#[cfg(not(target_os = "macos"))]
mod platform {
    use std::{io, path::{Path, PathBuf}};

    pub(super) fn initial_directory() -> PathBuf {
        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
    }

    pub(super) fn ensure_access_for_path(_: &Path) -> Result<(), String> {
        Ok(())
    }

    pub(super) fn prompt_for_folder_access_message() -> String {
        "Folder access prompts are only available on macOS.".to_string()
    }

    pub(super) fn access_status_message() -> String {
        "Folder access prompts are only available on macOS.".to_string()
    }

    pub(super) fn open_full_disk_access_settings_message() -> String {
        "Full Disk Access is only available on macOS.".to_string()
    }

    pub(super) fn with_access<T>(_: &Path, f: impl FnOnce() -> io::Result<T>) -> io::Result<T> {
        f()
    }
}
