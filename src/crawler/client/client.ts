import axios from 'axios'
import { LoginAndGetCookie } from '@/crawler/session/cookie'
import { isUndefinedOrNull, stringifyCookie } from '@/crawler/session/utils'

let cookie: Cookie

const client = axios.create({})

client.interceptors.request.use((request) => {
    request.headers!.cookie = stringifyCookie(getCookie())
    return request
})

const getCookie = (): Cookie => {
    if (isUndefinedOrNull(cookie)) {
        throw new Error('cookie没有被正确初始化')
    }
    return cookie
}

const initCookie = async (username: string, password: string) => {
    return await LoginAndGetCookie(username, password)
}

export { client }
