import downloadFile from "src/downloadFile/index"
/*
    ** 前端导出xlsx或者csv
    ** @params title为表格表头, [{key: 'name', value: '姓名'}, {key: 'age', value: '年龄'}]
    ** @params data为数据 [{name: '小王', age: 25}]
    ** @params fileName为文件名
*/
export interface XlsTitle {
    key: string,
    value: string
}
export default function exportXlsOrCsv(title: XlsTitle[], data: Record<string, any>[], fileName?: string): void {
    if (!title || !Array.isArray(title) || title.length < 1) {
        throw new Error('The table requires an array of header information')
    }
    let downloadFileName: string | null
    if (fileName) {
        const tableFileSuffix = ['xlsx', 'xls', 'xlsb', 'xlsm', 'csv']
        const suffixIndex = fileName.split('.').length - 1, fileSuffix = fileName.split('.')[suffixIndex]
        if (!tableFileSuffix.includes(fileSuffix)) {
            throw new Error("Table files should therefore end with ['xlsx', 'xls', 'xlsb', 'xlsm', 'csv'] suffix")
        } else {
            downloadFileName = fileName
        }
    }
    const result: string[] = [], tableTitleKey: string[] = [], tableTitleValue: string[] = []
    title.forEach((item: XlsTitle) => {
        item.key && tableTitleKey.push(item.key)
        item.value && tableTitleValue.push(item.value)
    })
    result.push(tableTitleValue.join(',') + '\n')
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((item: Record<string, any>) => {
            const list: any = {}
            tableTitleKey.forEach((key: string) => {
                list[key] = item[key]
            })
            result.push(Object.values(list).join(',') + '\n')
        })
    }
    const blob = new Blob(['\uFEFF' + result.join('')], { // '\uFEFF'防止乱码
        type: 'text/plain;charset=utf-8',
    })
    downloadFile(blob, fileName || 'download.xlsx')
}