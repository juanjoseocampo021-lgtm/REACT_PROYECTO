#!/usr/bin/env bash
# Backend build script for Render
set -e

echo "=== Installing backend dependencies ==="
pip install -r requirements.txt

echo "=== Backend build complete ==="
