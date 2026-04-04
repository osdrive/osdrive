//! Immutable snapshot database for filesystem indexes.

mod builder;
mod error;
mod format;
mod path;
mod reader;

pub use builder::{DbBuilder, DbStats, DbSummary, InputEntry, OwnedInputEntry};
pub use error::{Error, Result};
pub use reader::{Db, NodeId, NodeRecord};
