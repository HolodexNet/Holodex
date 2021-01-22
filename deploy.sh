#!/bin/sh

set -o errexit

cd /opt/holoclips || { echo "No directory found"; exit 1; }

git pull origin master

npm install

npm run build

