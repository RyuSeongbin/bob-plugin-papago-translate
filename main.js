var config = require('./config.js');
var utils = require('./utils.js');


function supportLanguages() {
    return config.supportedLanguages.map(([standardLang]) => standardLang);
}

function translate(query) {
    (async () => {
        const targetLanguage = utils.langMap.get(query.detectTo);
        const sourceLanguage = utils.langMap.get(query.detectFrom);
        if (!targetLanguage) {
            const err = new Error();
            Object.assign(err, {
                _type: 'unsupportLanguage',
                _message: '不支持该语种',
            });
            throw err;
        }
        let source_lang = sourceLanguage || 'zh-CN';
        let target_lang = targetLanguage || 'en';
        const translate_text = query.text || '';
        if (translate_text !== '') {
            const header = {
                'Host': 'openapi.naver.com',
                'user-agent': 'curl/7.49.1',
                'accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Naver-Client-Id': 'DnwZlFQkFWGtMDVQOi1B',
                'X-Naver-Client-Secret': 'rzExPetESt',
                //'Content-Length': '51'
                // https://ttime.timerecord.cn/pages/2368e1/#_2-注册应用 密钥申请可参照这个链接(免费1万字符/天)
                // 官网: https://developers.naver.com/main/
            }
            const urlDetect = 'https://openapi.naver.com/v1/papago/detectLangs';
            const url = 'https://openapi.naver.com/v1/papago/n2mt';
            try {
                const detectResp = await $http.request({
                    method: "POST",
                    url: urlDetect,
                    header: header,
                    body: {query: translate_text}
                });
                if (!detectResp.data || !detectResp.data.langCode) {
                    const errMsg = detectResp.data ? JSON.stringify(detectResp.data) : '未知错误1'
                    query.onCompletion({
                        error: {
                            type: 'unknown',
                            message: errMsg,
                            addtion: errMsg,
                        },
                    });
                }
                source_lang = detectResp.data.langCode;
                if ('auto' === target_lang) {
                    if (source_lang !== 'ko') {
                        target_lang = 'ko';
                    } else {
                        target_lang = 'zh-CN';
                    }
                }
                const resp = await $http.request({
                    method: "POST",
                    url: url,
                    header: header,
                    body: {"source": source_lang, "target": target_lang, "text": translate_text}
                });
                if (!resp.data || !resp.data.message.result.translatedText) {
                    const errMsg = detectResp.data ? JSON.stringify(resp.data) : '未知错误2'
                    query.onCompletion({
                        error: {
                            type: 'unknown',
                            message: errMsg,
                            addtion: errMsg,
                        },
                    });
                } else {
                    query.onCompletion({
                        result: {
                            from: utils.langMapReverse.get(source_lang),
                            to: utils.langMapReverse.get(target_lang),
                            toParagraphs: resp.data.message.result.translatedText.split('\n'),
                        },
                    });
                }

            } catch (e) {
                Object.assign(e, {
                    _type: 'network',
                    _message: '接口请求错误 - ' + JSON.stringify(e),
                });
                throw e;
            }
        }
    })().catch((err) => {
        query.onCompletion({
            error: {
                type: err._type || 'unknown',
                message: err._message || '未知错误3',
                addtion: err._addtion,
            },
        });
    });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
