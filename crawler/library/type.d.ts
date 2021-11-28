enum SearchWay {
    // 按任意词查询
    Any = '',
    // 标题名
    Title = 'title',
    // 正题名：一本书的主要名称
    TitleProper = 'title200a',
    // ISBN号
    Isbn = 'isbn',
    // 著者
    Author = 'author',
    // 主题词
    SubjectWord = 'subject',
    // 分类号
    ClassNo = 'class',
    // 控制号
    CtrlNo = 'ctrlno',
    // 订购号
    OrderNo = 'orderno',
    // 出版社
    Publisher = 'publisher',
    // 索书号
    CallNo = 'callno',
}

enum SortWay {
    // 匹配度
    MatchScore = 'score',
    // 出版日期
    PublishDate = 'pubdate_sort',
    // 主题词
    Subject = 'subject_sort',
    // 标题名
    Title = 'title_sort',
    // 作者
    Author = 'author_sort',
    // 索书号
    CallNo = 'callno_sort',
    // 标题名拼音
    Pinyin = 'pinyin_sort',
    // 借阅次数
    LoanCount = 'loannum_sort',
    // 续借次数
    RenewCount = 'renew_sort',
    // 题名权重
    TitleWeight = 'title200Weight',
    // 正题名权重
    TitleProperWeight = 'title200aWeight',
    // 卷册号
    Volume = 'title200h'
}

enum SortOrder {
    Asc = 'asc',
    Desc = 'desc',
}


interface SearchLibraryRequest {
    // 搜索关键字
    keyword: string,
    // 搜索结果数量
    rows: number,
    // 搜索分页号
    page: number,
    // 搜索方式
    searchWay: SearchWay,
    // 搜索结果的排序方式
    sortWay: SortWay,
    // 搜索结果的升降序方式
    sortOrder: SortOrder,
}

interface Book {
    // 图书号
    bookId: string,
    // ISBN号
    isbn: string,
    // 图书标题
    title: string,
    // 图书作者
    author: string,
    // 出版社
    publisher: string,
    // 出版日期
    publishDate: string,
    // 索书号
    callNo: string,
}

interface SearchLibraryResult {
    // 检索总结果数(所有页面的结果总数)
    resultCount: number,
    // 检索用时
    useTime: number,
    // 当前页号
    currentPage: number,
    // 总页数
    totalPages: number,
    // 当前页面图书列表
    bookList: [Book],
}