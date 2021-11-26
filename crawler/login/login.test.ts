import { encryptPassword, login } from './login'

describe('Login Crawler', () => {
    it('should return a valid login', async () => {
        const mockUserName = 'test'
        const mockPassword = 'test'
        await login(mockUserName,mockPassword)
    })
})
