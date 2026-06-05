var config = require('./config.js');
var utils = require('./utils.js');

var API_BASE_URL = 'https://papago.apigw.ntruss.com';
var DETECT_URL = API_BASE_URL + '/langs/v1/dect';
var TRANSLATE_URL = API_BASE_URL + '/nmt/v1/translation';


function supportLanguages() {
    return config.supportedLanguages.map(([standardLang]) => standardLang);
}

function optionValue(name) {
    return typeof $option !== 'undefined' && $option[name] ? String($option[name]).trim() : '';
}

function createError(type, message, addition) {
    var err = new Error(message);
    err._type = type || 'unknown';
    err._message = message || '未知错误';
    err._addition = addition;
    return err;
}

function papagoHeaders() {
    var clientId = optionValue('client_id');
    var clientSecret = optionValue('client_secret');

    if (!clientId || !clientSecret) {
        throw createError(
            'param',
            '请先在插件设置中填写 Naver Cloud Papago 的 Client ID 和 Client Secret'
        );
    }

    return {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
    };
}

function parsePapagoError(resp, fallbackMessage) {
    if (!resp) {
        return fallbackMessage || 'Papago 接口无响应';
    }

    var data = resp.data;
    if (!data) {
        return fallbackMessage || 'Papago 接口返回为空';
    }

    if (data.errorMessage) {
        return data.errorMessage + (data.errorCode ? ' (' + data.errorCode + ')' : '');
    }

    if (data.message && typeof data.message === 'string') {
        return data.message;
    }

    return JSON.stringify(data);
}

async function requestPapago(url, body, fallbackMessage) {
    var resp = await $http.request({
        method: 'POST',
        url: url,
        header: papagoHeaders(),
        body: body,
    });

    return resp;
}

async function detectLanguage(text) {
    var resp = await requestPapago(DETECT_URL, { query: text }, '语言检测失败');
    if (!resp.data || !resp.data.langCode) {
        throw createError('api', parsePapagoError(resp, '语言检测失败'));
    }
    return resp.data.langCode;
}

function resolveAutoTarget(sourceLang) {
    return sourceLang === 'ko' ? 'zh-CN' : 'ko';
}

function translate(query) {
    (async () => {
        const targetLanguage = utils.langMap.get(query.detectTo);
        const sourceLanguage = utils.langMap.get(query.detectFrom);
        if (!targetLanguage) {
            throw createError('unsupportLanguage', '不支持该目标语种');
        }

        var translateText = query.text || '';
        if (!translateText) {
            query.onCompletion({ result: { from: query.detectFrom, to: query.detectTo, toParagraphs: [] } });
            return;
        }

        var sourceLang = sourceLanguage || 'auto';
        var targetLang = targetLanguage || 'ko';
        var detectedLang = sourceLang;

        try {
            if (targetLang === 'auto') {
                detectedLang = sourceLang === 'auto' ? await detectLanguage(translateText) : sourceLang;
                targetLang = resolveAutoTarget(detectedLang);
            }

            var resp = await requestPapago(
                TRANSLATE_URL,
                { source: sourceLang, target: targetLang, text: translateText },
                '翻译失败'
            );
            var result = resp.data && resp.data.message && resp.data.message.result;

            if (!result || !result.translatedText) {
                throw createError('api', parsePapagoError(resp, '翻译失败'));
            }

            sourceLang = result.srcLangType || detectedLang || sourceLang;
            targetLang = result.tarLangType || targetLang;

            query.onCompletion({
                result: {
                    from: utils.langMapReverse.get(sourceLang) || query.detectFrom,
                    to: utils.langMapReverse.get(targetLang) || query.detectTo,
                    toParagraphs: result.translatedText.split('\n'),
                },
            });
        } catch (e) {
            if (e._type) {
                throw e;
            }
            throw createError('network', '接口请求错误 - ' + parsePapagoError(e, e.message || '未知网络错误'));
        }
    })().catch((err) => {
        query.onCompletion({
            error: {
                type: err._type || 'unknown',
                message: err._message || '未知错误3',
                addition: err._addition,
            },
        });
    });
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
