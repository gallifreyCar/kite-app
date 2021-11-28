import axios from 'axios'
import * as Buffer from 'buffer'
import * as qs from 'qs'
import { createWorker, Worker } from 'tesseract.js'
import {
    axiosPostResolveRedirect,
    encryptAES,
    filterCookie,
    isRedirectStatus,
    mergeCookie,
    parseCookie,
} from '../utils'
import {
    CAPTCHA_URL,
    DDDDOCR_URL,
    HEADERS,
    MAX_CAPTCHA_COUNT,
    NEED_CAPTCHA_URL,
    SSO_LOGIN_URL,
    TESS_ENG_DATA_PATH,
} from '@/constants'

type TesseractWorker = Worker | undefined

let worker: TesseractWorker

/**
 * 带有最大重试次数的登录SSO
 * @warning 使用tesseract进行验证码识别，必须调用initWorker()方法初始化
 * @param username
 * @param password
 */
export const ssoLogin = async (username: string, password: string): Promise<Cookie> => {
    let retryCount = 0
    let lastErrorMessage = ''
    while (retryCount < MAX_CAPTCHA_COUNT) {
        try {
            const cookie = await getSSOCookie(username, password)
            return cookie
        } catch (e: any) {
            console.warn(`第${retryCount + 1}次尝试: ${e.message}，重试中...`)
            lastErrorMessage = e.message
            retryCount++
        }
    }
    throw new Error('登录失败超出最大次数限制：' + lastErrorMessage)
}

/**
 * 尝试登录获取Cookie
 * @warning 使用tesseract进行验证码识别，必须调用initWorker()方法初始化
 * @param username
 * @param password
 */
export const getSSOCookie = async (username: string, password: string): Promise<Cookie> => {
    try {
        const res = await axios.get(SSO_LOGIN_URL)
        const originCookie = res.headers['set-cookie']![0]
        const indexCookie = filterCookie(originCookie)
        const loginHtml = res.data
        let captcha: string = ''
        const needCaptcha = await needCaptchaCheck(indexCookie, username)
        if (needCaptcha) {
            const captchaImage = await getCaptchaImageBase64(CAPTCHA_URL, indexCookie)
            // captcha = await recognizeCaptcha(captchaImage)
            captcha = await recognizeCaptchaWithTesseract(captchaImage)
            if (!isCaptchaFormatCorrect(captcha)) throw new Error('识别验证码格式不正确')
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
            ...parseCookie(indexCookie),
            ...authCookie,
        }
    } catch (e: any) {
        throw new Error('尝试获取SSO登录Cookie失败: ' + e.message)
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
        res = await axiosPostResolveRedirect(SSO_LOGIN_URL, qs.stringify(params), {
            ...HEADERS,
            'content-type': 'application/x-www-form-urlencoded',
            cookie,
        })
    } catch (e: any) {
        throw new Error('登录SSO状态码非302遇到错误: ' + e.message)
    }
    const status = res.status
    if (isRedirectStatus(status)) {
        if (res.headers['set-cookie']) {
            return mergeCookie('', res.headers['set-cookie'])
        }
        throw new Error('登录SSO状态码302，但未获取到Cookie')
    }

    const resHtml = res.data
    if (resHtml.includes('无效的验证码')) {
        throw new Error('登录SSO状态码200，验证码错误')
    } else if (resHtml.includes('您提供的用户名或者密码有误')) {
        throw new Error('登录SSO状态码200，用户名或密码错误')
    }
    throw new Error('登录SSO状态码200，未知错误')
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

const isCaptchaFormatCorrect = (captcha: string): boolean => {
    const captchaRegex = /^[0-9a-zA-Z]{4}$/
    return captcha.length === 4 && captchaRegex.test(captcha)
}

/**
 * Worker初始化
 */
export const initTesseractWorker = async (): Promise<any> => {
    if (worker) {
        return
    }
    try {
        worker = createWorker({
            langPath: TESS_ENG_DATA_PATH,
            gzip: false,
        })
        await worker.load()
        await worker.loadLanguage('eng')
        await worker.initialize('eng')
    } catch (e: any) {
        throw new Error('初始化Worker失败: ' + e)
    }
}

/**
 * Worker清理
 * @param cookie
 */
export const terminateTesseractWorker = async () => {
    if (worker) {
        await worker.terminate()
        worker = undefined
    }
}
