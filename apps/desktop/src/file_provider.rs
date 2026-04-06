#[cfg(target_os = "macos")]
mod platform {
    use std::{ptr::NonNull, sync::mpsc, time::Duration};

    use crate::vfs_model;
    use block2::RcBlock;
    use objc2::AnyThread;
    use objc2_file_provider::{NSFileProviderDomain, NSFileProviderManager};
    use objc2_foundation::{NSArray, NSError, NSString};
    use opener::open;

    const DOMAIN_IDENTIFIER: &str = "hello-world";
    const WAIT_TIMEOUT: Duration = Duration::from_secs(5);
    const EXTENSIONS_SETTINGS_URL: &str =
        "x-apple.systempreferences:com.apple.ExtensionsPreferences";

    pub(crate) fn refresh_status_message() -> String {
        match domain_registered() {
            Ok(true) => {
                format!(
                    "Registered. Open Finder and look for '{}' in the sidebar.",
                    vfs_model::DOMAIN_DISPLAY_NAME
                )
            }
            Ok(false) => {
                "Not registered. Click Register with macOS to create the Finder sidebar entry."
                    .to_string()
            }
            Err(error) => format!("Unable to read domains: {error}"),
        }
    }

    pub(crate) fn register_status_message() -> String {
        match register_domain() {
            Ok(()) => refresh_status_message(),
            Err(error) => format!("Registration failed: {error}"),
        }
    }

    pub(crate) fn unregister_status_message() -> String {
        match unregister_domain() {
            Ok(()) => refresh_status_message(),
            Err(error) => format!("Removal failed: {error}"),
        }
    }

    pub(crate) fn open_share_extension_settings_message() -> String {
        match open(EXTENSIONS_SETTINGS_URL) {
            Ok(()) => "Opened System Settings so you can enable 'OSDrive'.".to_string(),
            Err(error) => format!("Couldn't open System Settings: {error}"),
        }
    }

    fn domain_registered() -> Result<bool, String> {
        Ok(list_domains()?
            .iter()
            .any(|identifier| identifier == DOMAIN_IDENTIFIER))
    }

    fn register_domain() -> Result<(), String> {
        let domain = make_domain();
        let (sender, receiver) = mpsc::channel();
        let completion = RcBlock::new(move |error: *mut NSError| {
            let _ = sender.send(error_message(error));
        });

        unsafe {
            NSFileProviderManager::addDomain_completionHandler(&domain, &completion);
        }

        recv_unit_result(receiver)
    }

    fn unregister_domain() -> Result<(), String> {
        let domain = make_domain();
        let (sender, receiver) = mpsc::channel();
        let completion = RcBlock::new(move |error: *mut NSError| {
            let _ = sender.send(error_message(error));
        });

        unsafe {
            NSFileProviderManager::removeDomain_completionHandler(&domain, &completion);
        }

        recv_unit_result(receiver)
    }

    fn list_domains() -> Result<Vec<String>, String> {
        let (sender, receiver) = mpsc::channel();
        let completion = RcBlock::new(
            move |domains: NonNull<NSArray<NSFileProviderDomain>>, error: *mut NSError| {
                let result = if let Some(error) = error_message(error) {
                    Err(error)
                } else {
                    let domains = unsafe { domains.as_ref() };
                    Ok(domains
                        .iter()
                        .map(|domain| unsafe { domain.identifier() }.to_string())
                        .collect())
                };

                let _ = sender.send(result);
            },
        );

        unsafe {
            NSFileProviderManager::getDomainsWithCompletionHandler(&completion);
        }

        receiver
            .recv_timeout(WAIT_TIMEOUT)
            .map_err(|_| "Timed out waiting for File Provider domains".to_string())?
    }

    fn recv_unit_result(receiver: mpsc::Receiver<Option<String>>) -> Result<(), String> {
        match receiver
            .recv_timeout(WAIT_TIMEOUT)
            .map_err(|_| "Timed out waiting for File Provider".to_string())?
        {
            Some(error) => Err(error),
            None => Ok(()),
        }
    }

    fn make_domain() -> objc2::rc::Retained<NSFileProviderDomain> {
        let identifier = NSString::from_str(DOMAIN_IDENTIFIER);
        let display_name = NSString::from_str(vfs_model::DOMAIN_DISPLAY_NAME);

        unsafe {
            NSFileProviderDomain::initWithIdentifier_displayName(
                NSFileProviderDomain::alloc(),
                &identifier,
                &display_name,
            )
        }
    }

    fn error_message(error: *mut NSError) -> Option<String> {
        let error = unsafe { error.as_ref() }?;
        Some(format!("{error:?}"))
    }
}

#[cfg(not(target_os = "macos"))]
mod platform {
    pub(crate) fn refresh_status_message() -> String {
        "File Provider registration is only available on macOS.".to_string()
    }

    pub(crate) fn register_status_message() -> String {
        refresh_status_message()
    }

    pub(crate) fn unregister_status_message() -> String {
        refresh_status_message()
    }

    pub(crate) fn open_share_extension_settings_message() -> String {
        "Share extensions are only available on macOS.".to_string()
    }
}

pub(crate) use platform::{
    open_share_extension_settings_message, refresh_status_message, register_status_message,
    unregister_status_message,
};
