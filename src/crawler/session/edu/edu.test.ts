import { initTesseractWorker, getSSOCookie, eduLogin } from '@/crawler/session'

describe('Edu Login Test', () => {
    jest.setTimeout(10000)
    beforeAll(async () => {
        await initTesseractWorker()
    })
    it('should sso', async () => {
        const username = 'username'
        const password = '123456'
        const ssoCookie = await getSSOCookie(username, password)
        const eduCookie = await eduLogin(ssoCookie)

        expect(ssoCookie).not.toBeUndefined()
        expect(eduCookie).not.toBeUndefined()
    })
})
