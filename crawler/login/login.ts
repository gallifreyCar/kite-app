import axios from 'axios'
import * as Buffer from 'buffer'
import FormData from 'form-data'
import * as CryptoJS from 'crypto-js'
import * as qs from 'qs'

const LOGIN_URL = 'https://authserver.sit.edu.cn/authserver/login'
const NEED_CAPTCHA_URL = 'https://authserver.sit.edu.cn/authserver/needCaptcha.html'
const CAPTCHA_URL = 'https://authserver.sit.edu.cn/authserver/captcha.html'
const DDDDOCR_URL = 'http://192.168.2.27:22334/recognition'

export const login = async (username: string, password: string) => {
    const res = await axios.get(LOGIN_URL)
    const cookie = res.headers['set-cookie']![0]
    const loginHtml = res.data
    const needCaptcha = loginHtml.includes('验证码')
    const pwdSalt = getPwdSalt(loginHtml)
    const captchaImage = await getCaptchaImageBase64(CAPTCHA_URL, cookie)
    const captchaResult = await recognizeCaptcha(captchaImage)

    const cookie1 = await loginWithAuth(
        loginHtml,
        username,
        password,
        captchaResult,
        pwdSalt,
        cookie
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
        password: encryptPassword(password, salt),
        captchaResponse: captcha,
        lt: getLT(html),
        dllt: 'userNamePasswordLogin',
        execution: 'e1s1',
        _eventId: 'submit',
        rmShown: '1',
    }
    const res = await axios.post(LOGIN_URL, qs.stringify(params), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: cookie,
        },
    })
    if (res.status === 301 || res.status === 302) {
        return res.headers['set-cookie']
    }
    if (res.data.includes('您提供的用户名或者密码有误')) {
        throw new Error('用户名或密码错误')
    }
    if (res.data.includes('无效的验证码')) {
        throw new Error('验证码错误')
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

function getEncrypt(data: any, key0: any, iv0: any) {
    key0 = key0.replace(/(^\s+)|(\s+$)/g, '')
    var key = CryptoJS.enc.Utf8.parse(key0)
    var iv = CryptoJS.enc.Utf8.parse(iv0)
    var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    })
    return encrypted.toString()
}
function encryptAES(data: any, salt: any) {
    if (!salt) {
        return data
    }
    var encrypted = getEncrypt(randomByte(64) + data, salt, randomByte(16))
    return encrypted
}
var allChars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
var charsLength = allChars.length
function randomByte(len: any) {
    var retStr = ''
    for (let i = 0; i < len; i++) {
        retStr += allChars.charAt(Math.floor(Math.random() * charsLength))
    }
    return retStr
}
