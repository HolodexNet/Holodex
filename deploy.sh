#!/bin/sh

set -o errexit

cd /opt/holodex || { echo "No directory found"; exit 1; }

git pull

npm install

npm run build

