import * as CryptoJS from 'crypto-js'
import * as cookie from 'cookie'
import { isUndefined } from 'lodash'
import axios from 'axios'

const $_chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
const _chars_len = $_chars.length
function _rds(len: number) {
    var retStr = ''
    let i
    for (i = 0; i < len; i++) {
        retStr += $_chars.charAt(Math.floor(Math.random() * _chars_len))
    }
    return retStr
}
const _gas = (data: string | CryptoJS.lib.WordArray, key0: string, iv0: string) => {
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
export const encryptAES = (data: string, _p1: string) => {
    if (!_p1) {
        return data
    }
    var encrypted = _gas(_rds(64) + data, _p1, _rds(16))
    return encrypted
}

export const filterCookie = (origin: string): string => {
    const parseCookie = cookie.parse(origin)
    delete parseCookie['path']
    return Object.keys(parseCookie)
        .map((key) => `${key}=${parseCookie[key]}`)
        .join('; ')
}

export const parseCookie = (cookieString: string): Cookie => {
    return cookie.parse(cookieString)
}

export const stringifyCookie = (cookie: Cookie) => {
    return Object.keys(cookie)
        .map((key) => `${key}=${cookie[key]}`)
        .join('; ')
}

export const mergeCookie = (prevCookie: string, setCookieArray: string[] | undefined): Cookie => {
    if (isUndefined(setCookieArray) || setCookieArray.length === 0) {
        return parseCookie(prevCookie)
    }
    const setCookie: Cookie = setCookieArray
        .map((cookie) => parseCookie(filterCookie(cookie)))
        .reduce((prev, curr) => ({ ...prev, ...curr }), {})
    const nextCookie: Cookie = {
        ...parseCookie(prevCookie),
        ...setCookie,
    }
    return nextCookie
}

export const axiosGetResolveRedirect = (url: string, cookie: Cookie) => {
    return axios.get(url, {
        headers: {
            cookie: stringifyCookie(cookie),
        },
        timeout: 1000,
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status <= 302,
    })
}

export const isRedirectStatus = (status: number) => {
    return status >= 300 && status <= 303
}

export const isUndefinedOrNull = (value: any) => {
    return isUndefined(value) || value === null
}
