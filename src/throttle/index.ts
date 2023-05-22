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
export default function throttle(fn: (arg?: any) => any, delay: number = 300): (...arg: any) => any {
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