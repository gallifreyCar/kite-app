import { getHotSearch } from '@/crawler/library/hot_search'

describe('hot_search test', () => {
    beforeAll(() => {
        jest.setTimeout(30000)
    })
    it('should get hot search', async () => {
        let hotSearch = await getHotSearch()
        expect(hotSearch.recentMonth.length).toBeGreaterThan(0)
        expect(hotSearch.totalTime.length).toBeGreaterThan(0)
    })
})
