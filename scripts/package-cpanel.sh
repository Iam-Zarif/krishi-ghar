#!/bin/sh
set -eu

if [ ! -d "dist" ]; then
  echo "dist directory not found. Run npm run build:dist first." >&2
  exit 1
fi

find dist -name ".DS_Store" -o -name "._*" -o -name "__MACOSX" | while IFS= read -r path; do
  rm -rf "$path"
done

rm -f Archive.zip dist/Archive.zip

(cd dist && zip -qr ../Archive.zip . -x ".DS_Store" "._*" "__MACOSX/*")
cp Archive.zip dist/Archive.zip

echo "Created Archive.zip and dist/Archive.zip"
