import axios from 'axios'
import { SSO_TO_EDU_LOGIN_URL } from '@/constants'
import { filterCookie, parseCookie, stringifyCookie } from '@/crawler/session'

export const eduLogin = async (ssoCookie: Cookie): Promise<Cookie> => {
    try {
        await axios.get(SSO_TO_EDU_LOGIN_URL, {
            headers: {
                cookie: stringifyCookie(ssoCookie),
            },
            maxRedirects: 1,
            timeout: 1000,
        })
    } catch (e: any) {
        if (e.message.includes('timeout')) {
            throw new Error('登录教务系统超时，请检查是否连接校园网')
        }
        const status = e.response.status
        if (status == 302 || status == 301) {
            const httpCookie = e.response.headers['set-cookie']![0]
            if (httpCookie) {
                return parseCookie(filterCookie(httpCookie))
            }
            throw new Error('登录教务系统状态码302，但未获取到Cookie')
        }
        throw new Error('登录教务系统状态码非302遇到错误: ' + e.message)
    }
    throw new Error('登录教务系统状态码200，登录失败')
}
