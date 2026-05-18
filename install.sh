#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v pnpm >/dev/null 2>&1; then
	echo "pnpm is required but was not found in PATH."
	echo "Install pnpm first: npm install -g pnpm"
	exit 1
fi

cd "$SCRIPT_DIR"

echo "Installing pnpm workspace dependencies..."
pnpm install

echo "Install completed for the Next.js app and services workspace packages."
