#!/usr/bin/env bash
set -euo pipefail

# 提取版本号，兼容 refs/tags/v1.1.0、v1.1.0、1.1.0
version=${1#refs/tags/}
version=${version#v}

# 创建插件压缩包（将 src 目录下的所有文件打包）
zip -r -j "bob-plugin-papago-translate-$version.bobplugin" src/*

# 计算插件压缩包的 SHA256 哈希
sha256=$(shasum -a 256 "bob-plugin-papago-translate-$version.bobplugin" | cut -d ' ' -f 1)
echo "$sha256"

# 构建下载链接
download_link="https://github.com/RyuSeongbin/bob-plugin-papago-translate/releases/download/v$version/bob-plugin-papago-translate-$version.bobplugin"

# 构建新版本信息的 JSON 字符串
new_version="{\"version\": \"$version\", \"desc\": \"Update Papago Translation API endpoint and credentials options.\", \"sha256\": \"$sha256\", \"url\": \"$download_link\", \"minBobVersion\": \"1.8.0\"}"

# 读取并更新 JSON 文件
json_file='appcast.json'
updated_json=$(jq --argjson new_version "$new_version" '.versions += [$new_version]' "$json_file")

# 将更新后的 JSON 字符串写回 JSON 文件
printf '%s\n' "$updated_json" > "$json_file"

# 创建 dist 目录并移动所有插件压缩包到该目录
mkdir -p dist
mv *.bobplugin dist
