import { initTesseractWorker } from '@/crawler/session/sso'
import { LoginAndGetCookie } from '@/crawler/session/cookie'

describe("cookie test", () => {
    beforeAll(() => {
        jest.setTimeout(30000);
    });

    it("should get cookie", async () => {
        const cookie = await LoginAndGetCookie("username", "password")
        expect(cookie).toBeTruthy()
    })
})