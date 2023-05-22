/*
    ** 通过a标签实现一般的下载
    ** @params source下载地址或者内容
    ** @params fileName为文件名
*/
export default function downloadFile(source: string | Blob, fileName: string): void {
    const verify = ['[object String]', '[object Blob]']
    if (!source || !verify.includes(Object.prototype.toString.call(source))) {
        throw new Error('The function accepts a file download address or file content (blob)')
    }
    if (!fileName) throw new Error('Please enter the download file name')
    let href: string = ''
    if (Object.prototype.toString.call(source) === verify[0]) {
        href = source as string
    } else if (Object.prototype.toString.call(source) === verify[1]) {
        href = window.URL.createObjectURL(source as Blob)
    }
    const a = document.createElement('a')
    a.href = href
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(href)
}