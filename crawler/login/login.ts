import axios from 'axios'
import * as Buffer from 'buffer'
import * as qs from 'qs'
import fetch from 'node-fetch'
import { encryptAES, filterCookie, parseCookie } from './utils'
import { CAPTCHA_URL, DDDDOCR_URL, HEADERS, LOGIN_URL, NEED_CAPTCHA_URL } from './constant'

/**
 * 尝试登录获取Cookie
 * @param username
 * @param password
 */
export const login = async (username: string, password: string): Promise<LoginCredential> => {
    try {
        const res = await axios.get(LOGIN_URL)
        const originCookie = res.headers['set-cookie']![0]
        const indexCookie = filterCookie(originCookie)
        const loginHtml = res.data
        let captcha: string = ''
        const needCaptcha = await needCaptchaCheck(indexCookie, username)
        if (needCaptcha) {
            const captchaImage = await getCaptchaImageBase64(CAPTCHA_URL, indexCookie)
            captcha = await recognizeCaptcha(captchaImage)
        }
        const pwdSalt = getPwdSalt(loginHtml)
        const authCookie = await loginWithAuth(
            loginHtml,
            username,
            password,
            captcha,
            pwdSalt,
            originCookie
        )
        return {
            username,
            password,
            cookie: {
                ...parseCookie(indexCookie),
                ...authCookie,
            },
        }
    } catch (e: any) {
        throw new Error('尝试获取登录Cookie失败: ' + e.message)
    }
}

/**
 * 从网页中获取salt
 * @param html
 */
const getPwdSalt = (html: string) => {
    const match = html.match(/var pwdDefaultEncryptSalt = "(.*?)";/)
    if (match) {
        return match[1]
    }
    throw new Error('获取salt失败')
}

/**
 * 获取验证码图片并转为base64
 * @param captchaUrl
 * @param cookie
 */
const getCaptchaImageBase64 = async (captchaUrl: string, cookie: string): Promise<string> => {
    let res
    try {
        res = await axios.get(CAPTCHA_URL, {
            responseType: 'arraybuffer',
            headers: {
                Cookie: cookie,
            },
        })
    } catch (e: any) {
        throw new Error('获取验证码图片失败: ' + e.message)
    }
    let buffer = new Buffer.Buffer(res.data, 'binary')
    const captchaImageBase64 = buffer.toString('base64')
    return captchaImageBase64
}

/**
 * 识别验证码
 * @param captchaImageBase64
 */
const recognizeCaptcha = async (captchaImageBase64: string): Promise<string> => {
    try {
        const res = await axios.post(DDDDOCR_URL, captchaImageBase64, {
            headers: {
                'Content-Type': 'text/plain',
            },
        })
        return res.data.result
    } catch (e: any) {
        throw new Error('识别验证码失败: ' + e.message)
    }
}

/**
 * 使用加密后的密码和CAS Ticket登录OA，获取Cookie
 * @param html
 * @param username
 * @param password
 * @param captcha
 * @param salt
 * @param cookie
 */
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
    let res
    try {
        res = await fetch('https://authserver.sit.edu.cn/authserver/login', {
            headers: {
                ...HEADERS,
                'content-type': 'application/x-www-form-urlencoded',
                cookie,
            },
            referrer: 'https://authserver.sit.edu.cn/authserver/login',
            referrerPolicy: 'no-referrer-when-downgrade',
            body: qs.stringify(params),
            method: 'POST',
            redirect: 'manual',
        })
    } catch (e: any) {
        throw new Error('尝试登录失败: ' + e.message)
    }

    if (res.status === 301 || res.status === 302) {
        const httpCookie = res.headers.get('set-cookie')
        if (httpCookie) {
            const cookie = parseCookie(filterCookie(httpCookie))
            return cookie
        }
    }
    throw new Error('登录失败，未获取到Cookie')
}

/**
 * 获取页面上面的CAS Ticket
 * @param html
 */
const getLT = (html: string): string => {
    const lt = html.match(/<input type="hidden" name="lt" value="(.*?)"/)![1]
    return lt
}

/**
 * 明文密码加salt后再加密
 * @param password
 * @param salt
 */
export const encryptPassword = (password: string, salt: string) => {
    return encryptAES(password, salt)
}

/**
 * 检查是否需要验证码
 * @param cookie
 * @param account
 */
const needCaptchaCheck = async (cookie: string, account: string): Promise<boolean> => {
    try {
        const res = await axios.get(
            `${NEED_CAPTCHA_URL}?username=${account}&pwdEncrypt2=pwdEncryptSalt`,
            {
                headers: {
                    Cookie: cookie,
                    Referer: 'https://authserver.sit.edu.cn/authserver/login',
                },
            }
        )
        const needCaptcha = res.data
        return needCaptcha
    } catch (e: any) {
        throw new Error('检查是否需要验证码失败: ' + e.message)
    }
}
