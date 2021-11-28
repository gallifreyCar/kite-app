import { initWorker, getSSOCookie } from '@/crawler/session'

describe('Edu Login Test', () => {
    jest.setTimeout(5000)
    beforeAll(async () => {
        await initWorker()
    })
    it('should sso', async () => {
        const username = '1234'
        const password = '1234'
        const ssoCookie = await getSSOCookie(username, password)
        // const eduCookie = await eduLogin(ssoCookie)

        expect(ssoCookie).not.toBeUndefined()
        // expect(eduCookie).not.toBeUndefined()
    })
})
