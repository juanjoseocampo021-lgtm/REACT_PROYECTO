#!/usr/bin/env bash
# Frontend build script for Render
set -e

echo "=== Installing dependencies ==="
npm install

echo "=== Building frontend ==="
npm run build

echo "=== Frontend build complete ==="
