import { sleep } from '@/utils/sleep'

describe('should', () => {
    it('should wait a while', async () => {
        const test = async (ms: number) => {
            const before = Date.now()
            await sleep(ms)
            const interval = Date.now() - before
            expect(interval).toBeGreaterThanOrEqual(ms)
        }
        for (const ms of [100, 500, 1000]) {
            await test(ms)
        }
    })
})
