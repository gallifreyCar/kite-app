import axios from 'axios'
import * as Buffer from 'buffer'
import * as CryptoJS from 'crypto-js'
import * as qs from 'qs'
import * as cookie from 'cookie'
import fetch from 'node-fetch'

interface CreateLogin {
  username: string
  password: string
  captcha?: string
  captcha_key?: string
}



const HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
    "Referer": "https://authserver.sit.edu.cn/authserver/login"
}
const LOGIN_URL = 'https://authserver.sit.edu.cn/authserver/login'
const NEED_CAPTCHA_URL = 'https://authserver.sit.edu.cn/authserver/needCaptcha.html'
const CAPTCHA_URL = 'https://authserver.sit.edu.cn/authserver/captcha.html'
const DDDDOCR_URL = 'http://127.0.0.1:5000/recognition'

const needCaptchaCheck = async (cookie: string,account: string) => {
    const res = await axios.get(`${NEED_CAPTCHA_URL}?username=${account}&pwdEncrypt2=pwdEncryptSalt`,{
        headers: {
            "Cookie": cookie,
            "Referer": "https://authserver.sit.edu.cn/authserver/login"
        }
    })
    return res.data
}

export const login = async (username: string, password: string) => {
    const res = await axios.get(LOGIN_URL)
    const originCookie = res.headers['set-cookie']![0]
    const cookie = filterCookie(originCookie)
    const loginHtml = res.data
    const needCaptcha = await needCaptchaCheck(cookie, username)
    const pwdSalt = getPwdSalt(loginHtml)
    const captchaImage = await getCaptchaImageBase64(CAPTCHA_URL, cookie)
    const captchaResult = await recognizeCaptcha(captchaImage)

    const cookie1 = await loginWithAuth(
        loginHtml,
        username,
        password,
        captchaResult,
        pwdSalt,
        originCookie
    )
    return 'Hello World'
}

const getPwdSalt = (html: string) => {
    // todo: error Handle
    const pwdSalt = html.match(/var pwdDefaultEncryptSalt = "(.*?)";/)![1]
    return pwdSalt
}

const getCaptchaImageBase64 = async (captchaUrl: string, cookie: string): Promise<string> => {
    const res = await axios.get(CAPTCHA_URL, {
        responseType: 'arraybuffer',
        headers: {
            Cookie: cookie,
        },
    })
    let buffer = new Buffer.Buffer(res.data, 'binary')
    const captchaImageBase64 = buffer.toString('base64')
    return captchaImageBase64
}

const recognizeCaptcha = async (captchaImageBase64: string): Promise<string> => {
    const res = await axios.post(DDDDOCR_URL, captchaImageBase64, {
        headers: {
            'Content-Type': 'text/plain',
        },
    })
    return res.data.result
}

const loginWithAuth = async (
    html: string,
    username: string,
    password: string,
    captcha: string,
    salt: string,
    cookie: string
) => {
    const params = {
        username,
        password: encryptAES(password, salt),
        captchaResponse: captcha,
        lt: getLT(html),
        dllt: 'userNamePasswordLogin',
        execution: 'e1s1',
        _eventId: 'submit',
        rmShown: '1',
    }
    const res = await fetch("https://authserver.sit.edu.cn/authserver/login", {
        "headers": {
            ...HEADERS,
            "content-type": "application/x-www-form-urlencoded",
            cookie,
        },
        "referrer": "https://authserver.sit.edu.cn/authserver/login",
        "referrerPolicy": "no-referrer-when-downgrade",
        body: qs.stringify(params),
        "method": "POST",
        // "mode": "cors",
        'redirect': 'manual', // set to `manual` to extract redirect headers, `error` to reject redirect
    });
    if (res.status === 301 || res.status === 302) {
        return res.headers
    }
    throw new Error('Login Failed')
}


const getLT = (html: string): string => {
    const lt = html.match(/<input type="hidden" name="lt" value="(.*?)"/)![1]
    return lt
}

export const encryptPassword = (password: string, salt: string) => {
    return encryptAES(password, salt)
}


const $_chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
const _chars_len = $_chars.length;
function _rds(len: number) {
    var retStr = '';
    let i;
    for (i = 0; i < len; i++) {
        retStr += $_chars.charAt(Math.floor(Math.random() * _chars_len));
    }
    return retStr;
}
const _gas = (data: string | CryptoJS.lib.WordArray, key0: string, iv0: string) => {
    key0 = key0.replace(/(^\s+)|(\s+$)/g, "");
    var key = CryptoJS.enc.Utf8.parse(key0);
    var iv = CryptoJS.enc.Utf8.parse(iv0);
    var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
const encryptAES = (data: string, _p1: string) => {
    if (!_p1) {
        return data;
    }
    var encrypted = _gas(_rds(64) + data, _p1, _rds(16));
    return encrypted;
}

const filterCookie = (origin: string): string => {
    const parseCookie = cookie.parse(origin)
    delete parseCookie["path"]
    return Object.keys(parseCookie).map(key => `${key}=${parseCookie[key]}`).join('; ')
}
