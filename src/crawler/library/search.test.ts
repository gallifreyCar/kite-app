import {
    SearchWay,
    SortOrder,
    SortWay,
    searchBookImageByBookArray,
    searchBook,
} from '@/crawler/library/search'

describe('search test', () => {
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
    }, 10000)
    it('should get image urls', async () => {
        const bookResult = await searchBook({
            keyword: 'Java',
            page: 1,
            rows: 10,
            searchWay: SearchWay.Title,
            sortOrder: SortOrder.Asc,
            sortWay: SortWay.Title,
        })
        const bookImageResult = await searchBookImageByBookArray(bookResult.bookList)

        // 图片搜索结果应当小于等于图书结果，因为封面可能搜不到
        expect(Object.keys(bookImageResult).length).toBeLessThanOrEqual(bookResult.bookList.length)

        // 检索图片出的每个结果应当都存在于图书的搜索结果
        const searchResultIsbnArray = bookResult.bookList.map((book) => book.isbn.replace(/-/g, ''))
        const imageResultIsbnArray = Object.keys(bookImageResult)
        for (const imageResultIsbn of imageResultIsbnArray) {
            expect(searchResultIsbnArray).toContain(imageResultIsbn)
        }
    }, 10000)
})
