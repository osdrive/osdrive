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
PROFILE=debug
RELEASE_FLAG=

if [ "$CONFIGURATION" = "Release" ]; then
  PROFILE=release
  RELEASE_FLAG=--release
fi

RUST_TARGETS=

for ARCH in ${ARCHS:-$(uname -m)}; do
  case "$ARCH" in
    arm64)
      RUST_TARGET="aarch64-apple-darwin"
      ;;
    x86_64)
      RUST_TARGET="x86_64-apple-darwin"
      ;;
    *)
      echo "error: unsupported architecture '$ARCH' for share library build." >&2
      exit 1
      ;;
  esac

  case " $RUST_TARGETS " in
    *" $RUST_TARGET "*)
      continue
      ;;
  esac

  RUST_TARGETS="$RUST_TARGETS $RUST_TARGET"
done

BUILT_LIBRARIES=

for RUST_TARGET in $RUST_TARGETS; do
  "$CARGO_BIN" build --manifest-path "$CRATE_DIR/Cargo.toml" --lib --target "$RUST_TARGET" $RELEASE_FLAG
  BUILT_LIBRARIES="$BUILT_LIBRARIES $TARGET_DIR/$RUST_TARGET/$PROFILE/libosdrive_share.a"
done

set -- $BUILT_LIBRARIES

if [ "$#" -eq 1 ]; then
  cp "$1" "$BUILT_PRODUCTS_DIR/libosdrive_share.a"
else
  UNIVERSAL_LIBRARY=$(mktemp "${TMPDIR:-/tmp}/osdrive-share.XXXXXX.a")
  trap 'rm -f "$UNIVERSAL_LIBRARY"' EXIT
  /usr/bin/lipo -create -output "$UNIVERSAL_LIBRARY" "$@"
  cp "$UNIVERSAL_LIBRARY" "$BUILT_PRODUCTS_DIR/libosdrive_share.a"
fi
