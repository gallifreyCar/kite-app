import { SearchWay, SortOrder, SortWay, searchBook } from '@/crawler/library'

describe('search test', () => {
    beforeAll(() => {
        jest.setTimeout(30000)
    })
    it('should show search result', async () => {
        const result = await searchBook({
            keyword: 'Java',
            page: 1,
            rows: 10,
            searchWay: SearchWay.Title,
            sortOrder: SortOrder.Asc,
            sortWay: SortWay.Title,
        })
        expect(result.currentPage).toBe(1)
        expect(result.bookList.length).toBeLessThanOrEqual(10)
    })
})
