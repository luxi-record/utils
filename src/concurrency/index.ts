/*
    ** 并发控制类
    ** @params taskQueue任务队列，每个任务返回promise
    ** @params maxTaskRunner 为最大并发数量
*/
export interface PromiseTask {
    (): Promise<any>
}
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