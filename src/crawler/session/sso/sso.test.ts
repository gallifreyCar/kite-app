import { initTesseractWorker, ssoLogin } from '@/crawler/session'

describe('SSO crawler test', () => {
    jest.setTimeout(30000)
    beforeAll(async () => {
        await initTesseractWorker()
    })

    it('should return sso cookie', async () => {
        const username = 'username'
        const password = 'password'
        const ssoCookie = await ssoLogin(username, password)

        expect(ssoCookie).toBeDefined()
        expect(ssoCookie).toHaveProperty('JSESSIONID')
    })
})
