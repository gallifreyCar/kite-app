export enum SearchWay {
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

export enum SortWay {
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
    Volume = 'title200h',
}

export enum SortOrder {
    Asc = 'asc',
    Desc = 'desc',
}

export const search = async (request: SearchLibraryRequest): Promise<SearchLibraryResult> => {
    let queryParams = {
        q: request.keyword,
        searchType: 'standard',
        isFacet: 'true',
        view: 'standard',
        searchWay: request.searchWay,
        rows: request.rows.toString(),
        sortWay: request.sortWay,
        sortOrder: request.sortOrder,
        hasholding: '1',
        searchWay0: 'marc',
        logical0: 'AND',
        page: request.page.toString(),
    }

    // TODO 数据爬取
    return { bookList: [], currentPage: 0, resultCount: 0, totalPages: 0, useTime: 0 }
}
