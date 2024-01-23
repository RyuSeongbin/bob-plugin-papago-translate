# 提取版本号（从标签名中去掉 "refs/tags/v" 部分）
version=${1#refs/tags/v}

# 创建插件压缩包（将 src 目录下的所有文件打包）
zip -r -j bob-plugin-papago-translate-$version.bobplugin src/*

# 计算插件压缩包的 SHA256 哈希
sha256_deeplx=$(shasum -a 256 bob-plugin-papago-translate-$version.bobplugin | cut -d ' ' -f 1)
echo $sha256_deeplx

# 构建下载链接
download_link="https://github.com/RyuSeongbin/bob-plugin-papago-translate/releases/download/v$version/bob-plugin-papago-translate-$version.bobplugin"

# 构建新版本信息的 JSON 字符串
new_version="{\"version\": \"$version\", \"desc\": \"Support access token.\", \"sha256\": \"$sha256_deeplx\", \"url\": \"$download_link\", \"minBobVersion\": \"0.5.0\"}"

# 读取并更新 JSON 文件
json_file='appcast.json'
json_data=$(cat $json_file)
updated_json=$(echo $json_data | jq --argjson new_version "$new_version" '.versions += [$new_version]')

# 将更新后的 JSON 字符串写回 JSON 文件
echo $updated_json > $json_file

# 创建 dist 目录并移动所有插件压缩包到该目录
mkdir dist
mv *.bobplugin dist