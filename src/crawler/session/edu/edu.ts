import axios, { AxiosResponse } from 'axios'
import { EDU_COOKIE_HEADERS_KEY, SSO_TO_EDU_LOGIN_URL } from '@/constants'
import {
    axiosGetResolveRedirect,
    filterCookie,
    isRedirectStatus,
    isUndefinedOrNull,
    mergeCookie,
    parseCookie,
    stringifyCookie,
} from '@/crawler/session'
import { get, isUndefined } from 'lodash'

const axiosInstance = axios.create({
    maxRedirects: 0,
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status <= 302,
})

/**
 * @description 用于教务系统多次重定向拦截Cookie
 * @param res
 */
const eduResponseInterceptor = (
    res: AxiosResponse
): Promise<AxiosResponse<any, any>> | AxiosResponse => {
    if (isRedirectStatus(res.status)) {
        const prevCookie = get(res, 'config.headers.cookie')
        const location = get(res, 'headers.location')
        const reqUrl = get(res, 'config.url', '')

        const cookieArray = res.headers['set-cookie']
        if (isUndefinedOrNull(cookieArray)) {
            return axiosInstance.get(location, {
                headers: {
                    cookie: prevCookie,
                    referer: reqUrl,
                },
            })
        }
        const nextCookie = mergeCookie(prevCookie, cookieArray)
        if (reqUrl.includes('ticketlogin?uid=')) {
            res.headers[EDU_COOKIE_HEADERS_KEY] = filterCookie(stringifyCookie(nextCookie))
            return res
        }
        return axiosInstance.get(location, {
            headers: {
                cookie: stringifyCookie(nextCookie),
                referer: res.config.url!,
            },
        })
    }
    return res
}

axiosInstance.interceptors.response.use(eduResponseInterceptor)

/**
 * @description 使用SSO的Cookie换取教务系统的Cookie
 * @param ssoCookie
 * @return Promise<Cookie>
 */
export const eduLogin = async (ssoCookie: Cookie): Promise<Cookie> => {
    try {
        const eduTicket = await getEduTicket(ssoCookie)
        return await getEduCookieFromTicket(eduTicket)
    } catch (e: any) {
        if (e.message.includes('timeout')) {
            throw new Error('登录教务系统超时，请检查是否连接校园网')
        }
        throw new Error('登录教务系统失败: ' + e.message)
    }
}

/**
 * @description 获取教务系统的Ticket
 * @param ssoCookie
 * @returns {Promise<>}
 */
const getEduTicket = async (ssoCookie: Cookie): Promise<EduTicket> => {
    let res
    try {
        res = await axiosGetResolveRedirect(SSO_TO_EDU_LOGIN_URL, ssoCookie)
    } catch (e: any) {
        throw new Error('获取教务系统Ticket失败, 未知错误: ' + e.message)
    }
    const status = res.status
    if (isRedirectStatus(status)) {
        const redirectUrl = res.headers.location
        if (isUndefinedOrNull(redirectUrl)) {
            throw new Error('获取教务系统Ticket失败，状态码302: 但未获取到Ticket')
        }
        return {
            ticket: redirectUrl,
            cookie: ssoCookie,
        }
    }
    throw new Error('获取教务系统Ticket失败, 状态码200')
}

/**
 * @description 使用Ticket获取教务系统的Cookie
 * @param ticket
 * @param cookie
 * @return Promise<Cookie>
 */
const getEduCookieFromTicket = async ({ ticket, cookie }: EduTicket): Promise<Cookie> => {
    let eduCookie: Cookie
    let res
    try {
        res = await axiosInstance.get(ticket, {
            headers: {
                cookie: stringifyCookie(cookie),
            },
        })
    } catch (e: any) {
        if (e.message.includes('timeout')) {
            throw new Error('登录教务系统超时，请检查是否连接校园网')
        }
        throw new Error('换取教务系统Ticket状态码出错: ' + e.message)
    }
    const xEduCookie = get(res.headers, EDU_COOKIE_HEADERS_KEY, undefined)
    if (isUndefined(xEduCookie)) throw new Error('换取教务系统Ticket状态码: 失败')
    eduCookie = parseCookie(xEduCookie)
    return eduCookie
}
