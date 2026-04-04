use std::fmt;
use std::io;

#[derive(Debug)]
pub enum Error {
    Io(io::Error),
    InvalidPath(&'static str),
    InvalidFormat(&'static str),
    NodeLimitExceeded,
}

pub type Result<T> = std::result::Result<T, Error>;

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(error) => write!(f, "io error: {error}"),
            Self::InvalidPath(message) => write!(f, "invalid path: {message}"),
            Self::InvalidFormat(message) => write!(f, "invalid format: {message}"),
            Self::NodeLimitExceeded => write!(f, "node limit exceeded"),
        }
    }
}

impl std::error::Error for Error {}

impl From<io::Error> for Error {
    fn from(value: io::Error) -> Self {
        Self::Io(value)
    }
}
