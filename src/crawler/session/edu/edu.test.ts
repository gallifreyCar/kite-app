import { eduLogin, ssoLogin } from '@/crawler/session'

describe('Edu Login Test', () => {
    jest.setTimeout(10000)
    it('should get edu cookie', async () => {
        const username = 'username'
        const password = 'password'
        const ssoCookie = await ssoLogin(username, password)

        expect(ssoCookie).not.toBeUndefined()
        const eduCookie = await eduLogin(ssoCookie)
        expect(eduCookie).not.toBeUndefined()
        expect(eduCookie).toHaveProperty('JSESSIONID')
    })
})
