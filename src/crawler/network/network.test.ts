import { login } from '@/crawler/network/index'

describe('network test', () => {
    it('should login', async function () {
        console.assert(await login('username', 'password'))
    })
})
