#!/usr/bin/env bash
# Render build script — runs from repo root
set -e

ROOT=$(pwd)

echo "=== Installing backend dependencies ==="
pip install -r TrimestreReact/backend/requirements.txt

echo "=== Building frontend ==="
cd "$ROOT/TrimestreReact/frontend"
npm install
npm run build

echo "=== Copying frontend build to backend/static ==="
mkdir -p "$ROOT/TrimestreReact/backend/app/static"
rm -rf "$ROOT/TrimestreReact/backend/app/static"/*
cp -r "$ROOT/TrimestreReact/frontend/dist/"* "$ROOT/TrimestreReact/backend/app/static/"

echo "=== Build complete ==="
