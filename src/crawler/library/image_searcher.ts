import axios from 'axios'
import { BOOK_IMAGE_INFO_URL } from '@/constants/crawler/library'

/**
 * 根据ISBN字符串搜索图书图片信息
 * 注意：返回的字典中key为isbn号(消除了所有的isbn中的'-'符号，仅保留数字)
 * 若待查找的isbn在key中不存在，那就表示查不到
 * @param isbnStr isbn字符串,如果有多个isbn，使用逗号分割
 * @return Promise<BookImageSearchResult> 返回一个key为isbn号的字典
 */
const searchBookImageByIsbnStr = async (isbnStr: string): Promise<BookImageSearchResult> => {
    const queryParams = {
        glc: 'U1SH021060',
        cmdACT: 'getImages',
        type: '0',
        isbns: isbnStr,
    }

    const response = await axios.get(BOOK_IMAGE_INFO_URL, {
        params: queryParams,
    })

    let responseJsonStr = response.data.trim()
    responseJsonStr = responseJsonStr.substring(1, responseJsonStr.length - 1)

    const bookImageInfoArray: BookImageInfo[] = JSON.parse(responseJsonStr)['result']

    let bookImageInfoDict: BookImageSearchResult = {}
    bookImageInfoArray.forEach((bookImageInfo) => {
        bookImageInfoDict[bookImageInfo.isbn] = bookImageInfo
    })
    return bookImageInfoDict
}

/**
 * 根据ISBN数组搜索所有的图书图片信息
 * @param isbnArray ISBN数组
 */
export const searchBookImageByIsbnArray = async (
    isbnArray: string[]
): Promise<BookImageSearchResult> => {
    return searchBookImageByIsbnStr(isbnArray.join(','))
}

export const searchBookImageByBookArray = async (
    bookArray: Book[]
): Promise<BookImageSearchResult> => {
    return searchBookImageByIsbnStr(bookArray.map((v) => v.isbn).join(','))
}
