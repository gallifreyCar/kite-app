import { search, SearchWay, SortOrder, SortWay } from '@/crawler/library/search'

describe('search test', () => {
    it('should show search result', async () => {
        const result = await search({
            keyword: 'Java',
            page: 1,
            rows: 10,
            searchWay: SearchWay.Title,
            sortOrder: SortOrder.Asc,
            sortWay: SortWay.Title,
        })
        console.log(result)
    }, 10000)
})
