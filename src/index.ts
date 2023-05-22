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

/*
    ** 通过a标签实现一般的下载
    ** @params source下载地址或者内容
    ** @params fileName为文件名
*/
export function downloadFile(source: string | Blob, fileName: string): void {
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

/*
    ** copy复制
    ** @params val复制的文本
    ** @return 复制成功与否
*/
export function copy(val: string): boolean {
    if (!val || typeof (val) !== 'string') throw new Error('Please enter the copy text content')
    let copySuccess: boolean = false
    const input = document.createElement('input')
    input.value = val
    document.body.appendChild(input)
    input.select() // 选择复制内容
    if (document.execCommand) {
        copySuccess = document.execCommand('copy') // 执行复制命令
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
    if (!document) throw new Error('Only applicable to browser environments')
    if (!key || !value) throw new Error('Please enter cookie key and value')
    let cookie = `${key}=${value};`
    if (d !== undefined) {
        const date = new Date(), expiresDate = date.getDate() + d
        date.setDate(expiresDate)
        cookie = cookie + `expires=${date.toUTCString()};`
    }
    document.cookie = cookie
}
export function getCookie(key: string): string | null {
    if (!document) throw new Error('Only applicable to browser environments')
    if (!key) throw new Error('Please enter cookie key')
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

/*
    ** 节流函数,时间戳简洁版本
    ** 定时器版：
    ** function throttle(fn, delay) {
    **    let timer = null
    **    return function () {
    **        if(!timer) {
    **            setTimeout(() => {
    **                fn()
    **                timer = null
    **            }, delay)
    **        }
    **    }
    ** }
*/
export function throttle(fn: (arg?: any) => any, delay: number = 300): (...arg: any) => any {
    if (!fn || typeof (fn) !== 'function') throw new Error('Throttle need a callback')
    let prevent = 0
    return function (this: any, ...arg: any) {
        let now = Date.now()
        if (now - prevent >= delay) {
            fn.call(this, arg)
            prevent = now
        }
    }
}

/*
    ** 简洁防抖函数
*/
export function debounce(fn: (arg?: any) => any, delay: number = 300, immediate?: boolean): (...arg: any) => any {
    if (!fn || typeof (fn) !== 'function') throw new Error('Debounce need a callback')
    let timer: any = null, immediately = immediate || false
    return function (this: any, ...arg: any) {
        if (immediately) {
            fn.call(this, arg)
            immediately = false
        } else {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                fn.call(this, arg)
            }, delay)
        }
    }
}

/*
    ** 类似moment的简洁时间格式化工具
*/
function timeFormat(time: string | number) {

}

/*
    ** 超长数字相加
    ** 只允许输入字符串，因为数字长度问题会把一些超大数字转化为科学计数法
    ** 例如: 0.000000000000003 ==> '3e-15'
*/
function numberAdd(a: string, b: string): string {
    if (!a || !b) throw new Error('Please enter two strings composed of numbers')
    const isReduce = (Number(a) > 0 && Number(b) < 0 || Number(a) < 0 && Number(b) > 0) ? true : false
    const isNegative = Number(a) < 0 && Number(b) < 0 ? true : false
    let resulet = '', carry = 0
    if(isReduce) {
        const numberOne = Number(a), numberTwo = Number(b)
        const absNumberOne = a.replace('-', ''), absNumberTwo = b.replace('-', '')
        const hasMinusSign = (Math.abs(numberOne) > Math.abs(numberTwo) && numberOne < 0) || (Math.abs(numberTwo) > Math.abs(numberOne) && numberTwo < 0) ? true : false
        const length = absNumberOne.length
        const big = Math.abs(numberOne) > Math.abs(numberTwo) ? absNumberOne : absNumberTwo
        const small = Math.abs(numberOne) < Math.abs(numberTwo) ? absNumberOne : absNumberTwo 
        for (let i = length - 1; i >= 0; i--) {
            const numberA = Number(big[i]), numberB = Number(small[i])
            const tmp = numberA - numberB - carry
            if(tmp < 0){
                carry = 1
                resulet = tmp + 10 + resulet
            } else {
                carry = 0
                resulet = tmp + resulet
            }
        }
        resulet = hasMinusSign ? `-${resulet}` : resulet
    } else {
        const stringOne = isNegative ? a.replace('-', '') : a
        const stringTwo = isNegative ? b.replace('-', '') : b
        const length = stringOne.length
        for (let i = length - 1; i >= 0; i--) {
            const numberA = Number(stringOne[i]), numberB = Number(stringTwo[i])
            const tmp = numberA + numberB + carry
            carry = Math.floor(tmp / 10)
            resulet = tmp % 10 + resulet
        }
        if(carry) resulet = carry + resulet
        resulet = isNegative ? `-${resulet}` : resulet
    }
    return resulet
}
export function largeNumberAdd(num1: string, num2: string): string {
    let stringOne = String(num1), stringTwo = String(num2) 
    const reg = /^(-?\d+)(\.\d+)?$/ // /^-?\d+$/ 整数 /^0+$/ 全零
    if (!reg.test(stringOne) || !reg.test(stringTwo)) {
        throw new Error('Please enter a string composed of numbers')
    }
    const stringOneLess = Number(stringOne) < 0 ? true : false
    const stringTwoLess = Number(stringTwo) < 0 ? true : false
    const isFloat = stringOne.includes('.') || stringTwo.includes('.')
    let pointIndex: number | null = null
    if(isFloat) {
        let stringOneFloat = stringOne.split('.')[1] || ''
        let stringTwoFloat = stringTwo.split('.')[1] || ''
        pointIndex = Math.max(stringOneFloat.length, stringTwoFloat.length)
        stringOneFloat = stringOneFloat.padEnd(pointIndex, '0')
        stringTwoFloat = stringTwoFloat.padEnd(pointIndex, '0')
        pointIndex = Number(`-${pointIndex}`)
        let stringOneInteger = stringOne.replace('-', '').split('.')[0]
        let stringTwoInteger = stringTwo.replace('-', '').split('.')[0]
        const maxLength = Math.max(stringOneInteger.length, stringTwoInteger.length)
        stringOneInteger = stringOneInteger.padStart(maxLength, '0')
        stringTwoInteger = stringTwoInteger.padStart(maxLength, '0')
        stringOne = stringOneLess ? `-${stringOneInteger}${stringOneFloat}` : stringOneInteger + stringOneFloat
        stringTwo = stringTwoLess ? `-${stringTwoInteger}${stringTwoFloat}` : stringTwoInteger + stringTwoFloat
    } else {
        let stringOneInteger = stringOne.replace('-', '')
        let stringTwoInteger = stringTwo.replace('-', '')
        const maxLength = Math.max(stringOneInteger.length, stringTwoInteger.length)
        stringOneInteger = stringOneInteger.padStart(maxLength, '0')
        stringTwoInteger = stringTwoInteger.padStart(maxLength, '0')
        stringOne = stringOneLess ? `-${stringOneInteger}` : stringOneInteger
        stringTwo = stringTwoLess ? `-${stringTwoInteger}` : stringTwoInteger
    }
    console.log(stringOne, stringTwo)
    const result = numberAdd(stringOne, stringTwo)
    if(pointIndex) return `${result.slice(0,pointIndex)}.${result.slice(pointIndex)}`
    return result
}

/*
    ** 简单的深拷贝
    ** 基本数据类型，数组，日期，正则，函数
*/
const simple = ['number', 'string', 'boolean', 'symbol', 'undefined']
export function deepClone(target: any, map = new WeakMap()): any {
    let source: any
    const type = typeof target
    if (simple.includes(type)) {
        source = target
        return source
    }
    if (typeof (target) === 'function') return new Function(`return ${target.toString()}`)()
    if (typeof (target) === 'object' && target === null) return null
    if (Object.prototype.toString.call(target) === '[object Date]') return new Date(target)
    if (Object.prototype.toString.call(target) === '[object RegExp]') return new RegExp(target)
    source = Array.isArray(target) ? [] : {}
    if (map.get(target)) {
        return map.get(target)
    }
    map.set(target, source)
    for (let key in target) {
        if (target.hasOwnProperty(key)) {
            if (typeof target[key] === 'object') {
                source[key] = deepClone(target[key], map);
            } else {
                source[key] = target[key];
            }
        }
    }
    return source
}

/*
    ** 一棵多叉树的路径搜索
    ** 回溯法
*/
export function searchPathFromTree(tree: Record<string, any>, key: string, value: string | number | boolean | null, childKey: string = 'child'): any[] {
    const path = []
    let resulet: any[] = []
    path.push(tree[key])
    if(tree[key] === value) return path
    const child = tree[childKey]
    const traverse = (data: any[], path: any[], key: string, value: string | number | boolean | null, childKey: string = 'child') => {
        if(!data.length) return
        for (let tree of data) {
            path.push(tree[key])
            if(tree[key] === value){
                resulet = [...path]
                break;
            }
            const child = Array.isArray(tree[childKey]) ? tree[childKey] : []
            traverse(child, path, key, value, childKey) // 遍历
            path.pop() // 回溯
        }
    }
    traverse(child, path, key, value, childKey)
    return resulet
}