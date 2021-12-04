import { initTesseractWorker, ssoLogin } from '@/crawler/session/sso/sso'
import { eduLogin } from '@/crawler/session/edu/edu'

export const LoginAndGetCookie = async (username: string, password: string) => {
    try {
        const ssoCookie = await ssoLogin(username, password)
        const eduCookie = await eduLogin(ssoCookie)
        return eduCookie
    } catch (e: any) {
        throw new Error('获取Cookie失败, 原因: ' + e.message)
    }
}
