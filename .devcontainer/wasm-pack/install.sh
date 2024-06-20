#!/bin/sh

set -e

ARCH=$(uname -m)

if [ "$ARCH" = "aarch64" ]; then
    apt-get update -y && apt-get install --no-install-recommends -y binaryen
fi
