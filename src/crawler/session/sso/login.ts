import axios from 'axios'
import * as Buffer from 'buffer'
import * as qs from 'qs'
import { createWorker } from 'Tesseract.js'
import { encryptAES, filterCookie, parseCookie } from './utils'
import { CAPTCHA_URL, DDDDOCR_URL, HEADERS, LOGIN_URL, NEED_CAPTCHA_URL } from '@/constants'
import { Worker } from 'tesseract.js'

type TesseractWorker = Worker | undefined

let worker: TesseractWorker

/**
 * 尝试登录获取Cookie
 * @warning 使用tesseract进行验证码识别，必须调用initWorker()方法初始化
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
            // captcha = await recognizeCaptcha(captchaImage)
            captcha = await recognizeCaptchaWithTesseract(captchaImage)
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
    try {
        await axios.post(LOGIN_URL, qs.stringify(params), {
            headers: {
                ...HEADERS,
                'content-type': 'application/x-www-form-urlencoded',
                cookie,
            },
            maxRedirects: 0,
        })
    } catch (e: any) {
        const status = e.response.status
        if (status === 301 || status === 302) {
            const httpCookie = e.response.headers['set-cookie']![0]
            if (httpCookie) {
                return parseCookie(filterCookie(httpCookie))
            }
            throw new Error('登录状态码302，但未获取到Cookie')
        }
        throw new Error('登录状态码非302遇到错误: ' + e.message)
    }
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

/**
 * Tesseract识别验证码
 * @param imgBase64
 */
const recognizeCaptchaWithTesseract = async (imgBase64: string): Promise<string> => {
    const prefix = 'data:image/png;base64,'
    try {
        if (!worker) throw new Error('tesseract worker 未初始化')
        const {
            data: { text },
        } = await worker!.recognize(prefix + imgBase64)
        return text.replace(/[\n|\s+]/g, '')
    } catch (e: any) {
        throw new Error('识别验证码失败: ' + e.message)
    }
}

/**
 * Worker初始化
 */
export const initWorker = async (): Promise<any> => {
    if (worker) {
        return
    }
    try {
        worker = createWorker({
            langPath: '.',
            gzip: false,
        })
        await worker.load()
        await worker.loadLanguage('eng')
        await worker.initialize('eng')
    } catch (e) {
        throw new Error('初始化Worker失败')
    }
}

/**
 * Worker清理
 * @param cookie
 */
export const terminateWorker = async () => {
    if (worker) {
        await worker.terminate()
        worker = undefined
    }
}
