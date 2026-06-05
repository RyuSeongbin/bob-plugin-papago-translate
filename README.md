# bob-plugin-papago-translate

Bob 的 Papago 翻译插件，使用 Naver Cloud Platform 的 Papago Translation API。


## 效果

![2023-12-10 00 44 47](https://github.com/RyuSeongbin/bob-plugin-papago-translate/assets/25927848/55a41df7-5fc7-44e4-96d7-15af2698ecfc)

## 配置

1. 登录 [Naver Cloud Platform Console](https://console.ncloud.com/)。
2. 进入 `Services > AI Services > Papago Translation > APIs`。
3. 如果还没有应用，点击 `Register Application`，输入应用名，并勾选 Papago Translation 相关 API。
4. 在应用列表中选择刚创建的应用，点击 `Credentials`。
5. 在弹窗里复制 `Client ID` 和 `Client Secret`，填到 Bob 的 Papago 插件设置里。

注意：这里要填的是 Papago Translation 应用的 `Client ID` / `Client Secret`，不是 Naver Cloud 账号的 `Access Key` / `Secret Key`。

## 说明

旧版 NAVER Developers Papago 翻译接口已于 2024-02-29 结束支持，本插件从 `v1.1.0` 起改用 Naver Cloud Platform Papago Translation API：

* 翻译：`https://papago.apigw.ntruss.com/nmt/v1/translation`
* 语言检测：`https://papago.apigw.ntruss.com/langs/v1/dect`

## 费用

Naver Cloud 当前价格页未列出 Papago Translation API 的固定免费额度。按官方价格页，Papago Text Translation API 按月请求字符数计费，计费单位为 `1,000,000` 字符，价格为 `20,000 KRW / 1,000,000` 字符，且会按 `1,000,000` 字符向上取整；例如月使用 `500,000` 字符也按 `1,000,000` 字符计费。

本插件主要使用 Text Translation API。Text Translation API 中 `source=auto` 的语言检测不单独计费；只有单独调用 Papago Language Detection API 时才按语言检测字符数另行计费。

费用可能随区域和 Naver Cloud 政策调整，请以官方价格页为准：<https://www.ncloud.com/charge/price/sg>

友情提示：Naver Cloud 可能会向新注册用户提供 `100,000 KRW` 免费使用 Credit 活动，通常需要先注册支付方式后再到活动页申请，Credit 可用于抵扣符合条件的 Naver Cloud 服务费用。该活动的资格、有效期、适用服务和申请入口可能会变化，请以 Naver Cloud 官方活动页和控制台 `Billing > Credit Management` 中的实际显示为准。即使有 Credit，也建议用完插件后及时停用不需要的 Papago Translation Application 或取消服务订阅，避免后续产生不必要费用。





ps: 
1. 参考https://github.com/akl7777777大佬写的自用的bob papago韩语韩语插件. 
2. Papago Translation API 文档: https://api.ncloud-docs.com/docs/en/ai-naver-papagonmt
3. Papago Translation 使用指南: https://guide.ncloud-docs.com/docs/en/papagotranslation-api
