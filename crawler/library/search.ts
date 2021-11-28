const search = async (request: SearchLibraryRequest):Promise<SearchLibraryResult> =>  {
    let queryParams = {
        'q': request.keyword,
        'searchType': 'standard',
        'isFacet': 'true',
        'view': 'standard',
        'searchWay': request.searchWay,
        'rows': request.rows.toString(),
        'sortWay': request.sortWay,
        'sortOrder': request.sortOrder,
        'hasholding': '1',
        'searchWay0': 'marc',
        'logical0': 'AND',
        'page': request.page.toString()
    }

    // TODO 数据爬取
    return { bookList: [], currentPage: 0, resultCount: 0, totalPages: 0, useTime: 0 };
}