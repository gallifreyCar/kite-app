import { checkStatus, login, logout } from '@/crawler/network/index'

describe('network test', () => {
    it('should login', async function () {
        console.assert((await login('username', 'password')).result == 1)
    })
    it('should logout', async function () {
        console.assert(await logout())
    })
    it('should check status', async function () {
        console.assert(await checkStatus())
    })
})
