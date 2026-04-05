#!/bin/sh
set -eu

if [ -n "${CARGO:-}" ]; then
  CARGO_BIN="$CARGO"
elif [ -x "$HOME/.cargo/bin/cargo" ]; then
  CARGO_BIN="$HOME/.cargo/bin/cargo"
elif command -v cargo >/dev/null 2>&1; then
  CARGO_BIN="$(command -v cargo)"
else
  echo "error: cargo not found. Set CARGO or install cargo in \$HOME/.cargo/bin." >&2
  exit 1
fi

REPO_ROOT=$(cd "$SRCROOT/../../.." && pwd)
CRATE_DIR="$REPO_ROOT/apps/desktop"
TARGET_DIR="${CARGO_TARGET_DIR:-$REPO_ROOT/target}"

if [ "$CONFIGURATION" = "Release" ]; then
  "$CARGO_BIN" build --manifest-path "$CRATE_DIR/Cargo.toml" --bin opendrive --release
  RUST_BINARY="$TARGET_DIR/release/opendrive"
else
  "$CARGO_BIN" build --manifest-path "$CRATE_DIR/Cargo.toml" --bin opendrive
  RUST_BINARY="$TARGET_DIR/debug/opendrive"
fi

APP_BINARY="$TARGET_BUILD_DIR/$EXECUTABLE_PATH"
mkdir -p "$(dirname "$APP_BINARY")"
cp "$RUST_BINARY" "$APP_BINARY"
