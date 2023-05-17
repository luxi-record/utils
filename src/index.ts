/*
    ** 并发控制类
    ** @params taskQueue任务队列，每个任务返回promise
    ** @params maxTaskRunner 为最大并发数量
*/
export class ConcurrencyControl {
    private taskQueue: PromiseTask[] = []
    private isStoped: boolean = true
    private maxTaskRunner: number = 0
    private tasksResult: any[] = []
    private taskRunning: number = 0
    private taskRunningIndex: number = 0
    constructor(taskQueue: PromiseTask[], maxTaskRunner: number) {
        let runner: number = maxTaskRunner
        if (!taskQueue || !Array.isArray(taskQueue)) {
            throw new Error('The concurrency control constructor must pass in the concurrency queue parameter')
        }
        if (!maxTaskRunner || !(typeof (maxTaskRunner) === 'number') || maxTaskRunner !== maxTaskRunner || maxTaskRunner === Infinity) {
            console.warn('The concurrency control number is invalid, The default is one')
            runner = 1
        }
        this.taskQueue = taskQueue
        this.maxTaskRunner = runner
    }
    public run(): Promise<any[]> {
        this.isStoped = false
        return new Promise((resolve, reject) => {
            const runTask = () => {
                while (this.taskRunning < this.maxTaskRunner && this.taskQueue.length && !this.isStoped) {
                    const task = this.taskQueue.shift()
                    this.taskRunning++
                    this.taskRunningIndex++
                    const resultIndex = this.taskRunningIndex - 1
                    if (task) {
                        const taskResult = task()
                        if (taskResult instanceof Promise) {
                            taskResult.then((res: any) => {
                                this.tasksResult[resultIndex] = res
                                this.taskRunning--
                                if (!this.isStoped) {
                                    runTask()
                                }
                            }).catch((err: any) => {
                                this.isStoped = true
                                reject(err)
                            })
                        } else {
                            this.tasksResult[resultIndex] = taskResult
                            this.taskRunning--
                            runTask()
                        }
                    }
                }
                if (this.taskRunning === 0 && this.taskQueue.length === 0) {
                    resolve(this.tasksResult)
                }
            }
            runTask()
        })
    }
    public stop(): void {
        this.isStoped = true
    }
    public get result() {
        return this.tasksResult
    }
}

/*
    ** 简易版并发控制类
    ** @params task任务队列，每个任务返回promise
    ** @params limit为最大并发数量
*/
export interface PromiseTask { 
    (): Promise<any> 
}
export function asyncTasks(task: PromiseTask[], limit: number = 1): Promise<any> {
    if (!task || !Array.isArray(task)) {
        throw new Error('Requires asynchronous queues')
    }
    let index = 0, resulet: any[] = []
    let queue = Array(limit).fill(null)
    queue = queue.map(() => {
        return new Promise((resolve, reject) => {
            const runTask = () => {
                if (index >= task.length) {
                    resolve('')
                    return
                }
                const taskItem = task[index]
                const resuletIdnex = index
                index++
                const promise = taskItem()
                if (promise instanceof Promise) {
                    promise.then((res) => {
                        resulet[resuletIdnex] = res
                        runTask()
                    }).catch((err) => {
                        reject(err)
                    })
                } else {
                    resulet[resuletIdnex] = promise
                    runTask()
                }
            }
            runTask()
        })
    })
    return Promise.all(queue).then(() => { return resulet })
}

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
export function exportXlsOrCsv(title: XlsTitle[], data: Record<string, any>[], fileName?: string): void {
    if (!title || !Array.isArray(title) || title.length < 1) {
        throw new Error('The table requires an array of header information')
    }
    let downloadFileName: string | null
    if (fileName) {
        const tableFileSuffix = ['xlsx', 'xls', 'xlsb', 'xlsm', 'csv']
        const suffixIndex = fileName.split('.').length - 1, fileSuffix = fileName.split('.')[suffixIndex]
        if(!tableFileSuffix.includes(fileSuffix)) {
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

/*
    ** 通过a标签实现一般的下载
    ** @params source下载地址或者内容
    ** @params fileName为文件名
*/
export function downloadFile(source: string | Blob, fileName: string): void {
    const verify = ['[object String]', '[object Blob]']
    if(!source || !verify.includes(Object.prototype.toString.call(source))) {
        throw new Error('The function accepts a file download address or file content (blob)')
    }
    if(!fileName) throw new Error('Please enter the download file name')
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

/*
    ** copy复制
    ** @params val复制的文本
    ** @return 复制成功与否
*/
export function copy(val: string): boolean {
    if(!val || typeof(val) !== 'string') throw new Error('Please enter the copy text content')
    let copySuccess: boolean = false
    const input = document.createElement('input')
    input.value = val
    document.body.appendChild(input)
    input.select() // 选择复制内容
    if(document.execCommand) {
        copySuccess= document.execCommand('copy') // 执行复制命令
    } else {
        navigator.clipboard.writeText(input.value)
        copySuccess = true
    }
    document.body.removeChild(input)
    return copySuccess
}

/*
    ** cookie操作
*/
export function setCookie(key: string, value: string, d?: number) {
    if(!document) throw new Error('Only applicable to browser environments')
    if(!key || !value) throw new Error('Please enter cookie key and value')
    let cookie = `${key}=${value};`
    if (d !== undefined) {
        const date = new Date(), expiresDate = date.getDate() + d
        date.setDate(expiresDate)
        cookie = cookie + `expires=${date.toUTCString()};`
    }
    document.cookie = cookie
} 
export function getCookie(key: string): string | null {
    if(!document) throw new Error('Only applicable to browser environments')
    if(!key) throw new Error('Please enter cookie key')
    if (!document.cookie) return null
    const cookie = document.cookie, array = cookie.split(';')
    let value: string | null = null
    for (let i = 0; i < array.length; i++) {
        if (array[i].trim().split('=')[0] === key) {
            value = array[i].trim().split('=')[1]
            break
        }
    }
    return value
} 
export function removeCookie(key: string) {
    setCookie(key, '', -1)
}
