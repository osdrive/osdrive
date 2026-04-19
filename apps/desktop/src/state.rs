use std::{ffi::OsString, fs::FileType, os::unix::fs::MetadataExt, path::PathBuf, rc::Rc};

use chrono::{DateTime, Local};
use gpui::{Context, EventEmitter};

use crate::permissions;

pub struct State {
    nodes: Vec<Rc<Node>>,

    backward: Vec<PathBuf>,
    forward: Vec<PathBuf>,
    current: PathBuf,

    selected: Option<usize>,
    last_error: Option<String>,
}

/// Represents a node on the filesystem.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Node {
    pub path: PathBuf,
    pub name: OsString,
    pub kind: NodeKind,
    pub size: u64,
    pub created: DateTime<Local>,
    pub modified: DateTime<Local>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NodeKind {
    File,
    Directory,
    Unknown, // TODO: Removing this
             // TODO: Handle symbolic links, etc
}

impl From<FileType> for NodeKind {
    fn from(value: FileType) -> Self {
        if value.is_dir() {
            NodeKind::Directory
        } else if value.is_file() {
            NodeKind::File
        } else {
            NodeKind::Unknown
        }
    }
}

impl State {
    pub fn init() -> Self {
        let mut this = Self {
            nodes: Default::default(),
            backward: Default::default(),
            forward: Default::default(),
            current: permissions::initial_directory(),
            selected: None,
            last_error: None,
        };
        this.load_content();
        this
    }

    pub fn path(&self) -> &PathBuf {
        &self.current
    }

    pub fn nodes(&self) -> &[Rc<Node>] {
        &self.nodes
    }

    pub fn selected(&self) -> Option<usize> {
        self.selected
    }

    pub fn set_path(&mut self, cx: &mut Context<Self>, path: PathBuf) {
        if !path.exists() {
            return;
        }

        if let Err(error) = permissions::ensure_access_for_path(&path) {
            self.last_error = Some(error);
            cx.notify();
            return;
        }

        if self.current != path {
            self.backward.push(self.current.clone());
            self.forward.clear();
            self.current = path;

            self.selected = None;
            self.last_error = None;

            cx.emit(PathChange);
            cx.notify();

            self.load_content();
        }
    }

    pub fn next_selected(&mut self, cx: &mut Context<Self>) {
        if let Some(selected) = self.selected {
            if self.selected != Some(self.nodes.len() - 1) {
                self.selected = Some(selected + 1);
                cx.emit(FocusSelection);
                cx.notify();
            }
        } else {
            self.selected = Some(0);
            cx.emit(FocusSelection);
            cx.notify();
        }
    }

    pub fn back_selected(&mut self, cx: &mut Context<Self>) {
        if let Some(selected) = self.selected {
            if self.selected != Some(0) {
                self.selected = Some(selected - 1);
                cx.emit(FocusSelection);
                cx.notify();
            }
        } else {
            self.selected = Some(0);
            cx.emit(FocusSelection);
            cx.notify();
        }
    }

    pub fn set_selection(&mut self, cx: &mut Context<Self>, selection: usize) {
        self.selected = Some(selection);
        cx.emit(FocusSelection);
        cx.notify();
    }

    pub fn clear_selection(&mut self, cx: &mut Context<Self>) {
        self.selected = None;
        // cx.emit(FocusSelection); // TODO
        cx.notify();
    }

    fn load_content(&mut self) {
        match permissions::with_access(self.path(), || {
            Ok(std::fs::read_dir(self.path())?
                .filter_map(|entry| {
                    let entry = entry.ok()?;
                    let metadata = entry.metadata().ok()?;

                    Some(Rc::new(Node {
                        path: entry.path(),
                        name: entry.file_name(),
                        kind: entry.file_type().ok()?.into(),
                        size: metadata.size(),
                        created: metadata.created().ok()?.into(),
                        modified: metadata.modified().ok()?.into(),
                    }))
                })
                .collect())
        }) {
            Ok(dir) => {
                self.last_error = None;
                self.nodes = dir;
            }
            Err(error) => {
                self.last_error = Some(format!("Couldn't read {}: {error}", self.path().display()));
                self.nodes = vec![];
            }
        }
    }

    pub fn last_error(&self) -> Option<&str> {
        self.last_error.as_deref()
    }

    pub fn can_go_back(&self) -> bool {
        !self.backward.is_empty()
    }

    pub fn go_back(&mut self, cx: &mut Context<Self>) {
        if let Some(previous) = self.backward.pop() {
            self.forward.push(self.current.clone());
            self.current = previous;
            self.selected = None;

            cx.emit(PathChange);
            cx.notify();

            self.load_content();
        }
    }

    pub fn can_go_forward(&self) -> bool {
        !self.forward.is_empty()
    }

    pub fn go_forward(&mut self, cx: &mut Context<Self>) {
        if let Some(previous) = self.forward.pop() {
            self.backward.push(self.current.clone());
            self.current = previous;

            cx.emit(PathChange);
            cx.notify();

            self.load_content();
        }
    }

    pub fn can_go_up(&self) -> bool {
        self.current.parent().is_some()
    }

    pub fn go_up(&mut self, cx: &mut Context<Self>) {
        if let Some(parent) = self.current.parent() {
            self.set_path(cx, parent.to_path_buf());
        }
    }
}

pub struct PathChange;
impl EventEmitter<PathChange> for State {}

pub struct FocusSelection;
impl EventEmitter<FocusSelection> for State {}
