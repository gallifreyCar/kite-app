interface SearchLibraryRequest {
    // 搜索关键字
    keyword: string
    // 搜索结果数量
    rows: number
    // 搜索分页号
    page: number
    // 搜索方式
    searchWay: SearchWay
    // 搜索结果的排序方式
    sortWay: SortWay
    // 搜索结果的升降序方式
    sortOrder: SortOrder
}

interface Book {
    // 图书号
    bookId: string
    // ISBN号
    isbn: string
    // 图书标题
    title: string
    // 图书作者
    author: string
    // 出版社
    publisher: string
    // 出版日期
    publishDate: string
    // 索书号
    callNo: string
}

interface SearchLibraryResult {
    // 检索总结果数(所有页面的结果总数)
    resultCount: number
    // 检索用时
    useTime: number
    // 当前页号
    currentPage: number
    // 总页数
    totalPages: number
    // 当前页面图书列表
    bookList: Book[]
}

interface BookImageInfo {
    // ISBN号
    isbn: string
    // 图片的原始来源
    coverlink: string
    // dataesb缓存的来源
    resourceLink: string
    status: number
}

type BookImageSearchResult = { [key: string]: BookImageInfo }
