/**
 * 异步等待一段时间
 * @param ms 要等待的毫秒数
 */
export const sleep = async (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
