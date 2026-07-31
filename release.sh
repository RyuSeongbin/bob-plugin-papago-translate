#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
    echo "Usage: $0 <version> [description]" >&2
    exit 1
fi

for command in jq shasum zip; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Missing required command: $command" >&2
        exit 1
    fi
done

# 兼容 refs/tags/v1.1.0、v1.1.0、1.1.0
version=${1#refs/tags/}
version=${version#v}
description=${2:-"Maintenance release."}

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Invalid version: $version (expected x.y.z)" >&2
    exit 1
fi

json_file="appcast.json"
info_file="src/info.json"
source_version=$(jq -r '.version' "$info_file")

if [[ "$source_version" != "$version" ]]; then
    echo "Version mismatch: $info_file is $source_version, requested $version" >&2
    exit 1
fi

if jq -e --arg version "$version" '.versions[] | select(.version == $version)' "$json_file" >/dev/null; then
    echo "Version $version already exists in $json_file" >&2
    exit 1
fi

archive_name="bob-plugin-papago-translate-$version.bobplugin"
archive_path="dist/$archive_name"
download_url="https://github.com/RyuSeongbin/bob-plugin-papago-translate/releases/download/v$version/$archive_name"

if [[ -e "$archive_path" ]]; then
    echo "Archive already exists: $archive_path" >&2
    exit 1
fi

mkdir -p dist
zip -j -X "$archive_path" \
    src/config.js \
    src/icon.png \
    src/info.json \
    src/main.js \
    src/utils.js

sha256=$(shasum -a 256 "$archive_path" | cut -d ' ' -f 1)
temp_json=$(mktemp "${TMPDIR:-/tmp}/papago-appcast.XXXXXX")
trap 'rm -f "$temp_json"' EXIT

jq \
    --arg version "$version" \
    --arg description "$description" \
    --arg sha256 "$sha256" \
    --arg url "$download_url" \
    '.versions += [{
        version: $version,
        desc: $description,
        sha256: $sha256,
        url: $url,
        minBobVersion: "1.8.0"
    }]' \
    "$json_file" > "$temp_json"

mv "$temp_json" "$json_file"
trap - EXIT

echo "Created $archive_path"
echo "SHA256: $sha256"
