import axios from 'axios'
import {
    HEADERS,
    NETWORK_AUTH_CHECK_STATUS_URL,
    NETWORK_AUTH_LOGIN_URL,
    NETWORK_AUTH_LOGOUT_URL,
} from '@/constants/crawler/network'

/**
 * 上网登录
 * @param username 上网登录用户名
 * @param password 上网登录密码
 */
export const login = async (username: string, password: string): Promise<LoginResult> => {
    const loginResponse: string = (
        await axios.get(NETWORK_AUTH_LOGIN_URL, {
            headers: HEADERS,
            params: {
                callback: 'dr1003',
                DDDDD: username,
                upass: password,
                '0MKKey': '123456',
                "R1'": '0',
                R2: '',
                R3: '0',
                R6: '0',
                para: '00',
                terminal_type: '1',
                lang: 'zh-cn',
                jsVersion: '4.1',
            },
        })
    ).data.trim()

    return JSON.parse(loginResponse.substring(7, loginResponse.length - 1))
}

/**
 * 获取当前上网状态
 */
export const checkStatus = async (): Promise<CheckStatusResult> => {
    const checkStatusResponse: string = (
        await axios.get(NETWORK_AUTH_CHECK_STATUS_URL, {
            headers: HEADERS,
            params: {
                callback: 'dr1002',
                jsVersion: '4.X',
                lang: 'zh',
            },
        })
    ).data.trim()
    return JSON.parse(checkStatusResponse.substring(7, checkStatusResponse.length - 1))
}

/**
 * 登出网络
 */
export const logout = async (): Promise<LogoutResult> => {
    const logoutResponse: string = (
        await axios.get(NETWORK_AUTH_LOGOUT_URL, {
            headers: HEADERS,
            params: {
                callback: 'dr1002',
                jsVersion: '4.1.3',
                lang: 'zh',
            },
        })
    ).data.trim()
    return JSON.parse(logoutResponse.substring(7, logoutResponse.length - 1))
}
