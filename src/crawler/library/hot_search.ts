import axios from 'axios'
import $ from 'cheerio'
import { HOT_SEARCH_URL } from '@/constants/crawler/library'
import { DataNode } from 'domhandler'

export const getHotSearch = async (): Promise<HotSearchResult> => {
    const response = await axios.get(HOT_SEARCH_URL)
    const document = $(response.data)

    const getWords = (selector: string): HotSearchItem[] => {
        const parseHotSearchItem = (itemText: string): HotSearchItem => {
            const [hotSearchWord, countText] = itemText.split('(').map((x) => x.trim())
            return {
                count: parseInt(countText.slice(0, -1)),
                hotSearchWord,
            }
        }
        return $('a', $(selector, document))
            .map((_, element) => (<DataNode>element.firstChild!).nodeValue)
            .map((_, s) => parseHotSearchItem(s))
            .get()
    }
    return {
        recentMonth: getWords('fieldset:nth-child(1)'),
        totalTime: getWords('fieldset:nth-child(2)'),
    }
}
