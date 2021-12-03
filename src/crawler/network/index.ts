/**
 * 上网登录
 * @param username 上网登录用户名
 * @param password 上网登录密码
 */
import axios from 'axios'

export const login = async (username: string, password: string): Promise<boolean> => {
    const loginResponse: string = (
        await axios.get('http://172.16.8.70/drcom/login', {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0',
            },
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
                v: '857',
            },
        })
    ).data.trim()

    const loginResponseJSON = JSON.parse(loginResponse.substring(7, loginResponse.length - 1))

    return loginResponseJSON.result == 1
}
// export const getUserInfo = async () => {}
// export const logout = async () => {}
