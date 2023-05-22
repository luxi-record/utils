/*
    ** 简洁防抖函数
*/
export default function debounce(fn: (arg?: any) => any, delay: number = 300, immediate?: boolean): (...arg: any) => any {
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