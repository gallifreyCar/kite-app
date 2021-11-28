import { initTesseractWorker, getSSOCookie, eduLogin } from '@/crawler/session'

describe('Edu Login Test', () => {
    jest.setTimeout(10000)
    beforeAll(async () => {
        await initTesseractWorker()
    })
    it('should sso', async () => {
        const username = 'username'
        const password = 'password'
        const ssoCookie = await getSSOCookie(username, password)

        expect(ssoCookie).not.toBeUndefined()
        await expect(eduLogin(ssoCookie)).rejects.toThrowError(
            '登录教务系统超时，请检查是否连接校园网'
        )
    })
})
