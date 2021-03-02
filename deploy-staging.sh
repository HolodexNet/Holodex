#!/bin/sh

set -o errexit

cd /opt/holodex || { echo "No directory found"; exit 1; }

git pull origin dev

npm ci

npm run build

