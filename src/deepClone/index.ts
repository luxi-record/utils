/*
    ** 简单的深拷贝
    ** 基本数据类型，数组，日期，正则，函数
*/
const simple = ['number', 'string', 'boolean', 'symbol', 'undefined']
export default function deepClone(target: any, map = new WeakMap()): any {
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