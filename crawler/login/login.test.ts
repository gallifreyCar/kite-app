import { encryptPassword, login } from './login'

describe('Login Crawler', () => {
    it('should return a valid login', async () => {
        await login('171042Y119', 'Wu849421294')
    })

    it('', () => {
        const salt = 'GVnJo5MaLXkB1cOS'
        const password = 'Wu849421294'
        const cipher = encryptPassword(password, salt)

        expect(cipher).toEqual(
            'jmuMEhJHnvDZLqEmKM0cVFS17jKQUmJk1/RRE2qeJKO3ZigLZWMI1f4J6FBDcRsnmOFruidNVsaZO7n+8l8vmqA5VPxwdK9/Qh0M7wOc8s='
        )
    })
})
