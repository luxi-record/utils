/*
    ** 类似moment的简洁时间格式化工具
    ** 使用Date()
*/
export type TimeFormat = 'YY-MM-DD HH:mm:ss' | 'YY-MM-DD' | 'YYYY' | 'hh:mm:ss' | 'MM' | 'YY/MM/DD' | 'YY/MM/DD HH:mm:ss' | 'hh:mm'
export type RegionType = 'year' | 'Y' | 'month' | 'M' | 'day' | 'D' | 'd' | 'hours' | 'h' | 'minutes' | 'm' | 'seconds' | 's'
const typeRegList = [
    { type: 'year', formatReg: /^Y{4}|Y{2}/g, regionReg: /^year$|^Y$/ },
    { type: 'month', formatReg: /M{2}/g, regionReg: /^month$|^M$/ },
    { type: 'day', formatReg: /D{2}/g, regionReg: /^day$|^D$|^d$/ },
    { type: 'hours', formatReg: /H{2}|h{2}/g, regionReg: /^hours$|^h$/ },
    { type: 'minutes', formatReg: /m{2}/g, regionReg: /^minutes$|^m$/ },
    { type: 'seconds', formatReg: /s{2}/g, regionReg: /^seconds$|^s$/ },
]
class DateTime {
    time: Date
    constructor(value?: string | number) {
        let time = value ? new Date(value) : new Date()
        if (time.toString() === 'Invalid Date') throw new Error('Please enter a valid time string or timestamp')
        this.time = time
    }
    private getRegion(val: number, region: RegionType, type: 'add' | 'reduce') {
        const now = this.time.getTime(), value = Number(val)
        if(Number.isNaN(value)) return
        const fullTimeMillisecond: any = {
            year: 365 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            hours: 60 * 60 * 1000,
            minutes: 60 * 1000,
            seconds: 1000
        }
        let resuletMillisecond = 0
        typeRegList.forEach(({ type, regionReg }) => {
            if (regionReg.test(region)) {
                resuletMillisecond = value * fullTimeMillisecond[type]
            }
        })
        return type === 'add' ? new Date(now + resuletMillisecond) : new Date(now - resuletMillisecond)
    }
    format(type: TimeFormat) {
        const fullTime: any = {
            year: this.time.getFullYear(),
            month: this.time.getMonth() + 1 >= 10 ? this.time.getMonth() + 1 : `0${this.time.getMonth() + 1}`,
            day: this.time.getDate() >= 10 ? this.time.getDate() : `0${this.time.getDate()}`,
            hours: this.time.getHours() >= 10 ? this.time.getHours() : `0${this.time.getHours()}`,
            minutes: this.time.getMinutes() >= 10 ? this.time.getMinutes() : `0${this.time.getMinutes()}`,
            seconds: this.time.getSeconds() >= 10 ? this.time.getSeconds() : `0${this.time.getSeconds()}`
        }
        if (type) {
            let result: any = type
            typeRegList.forEach(({ formatReg, type }) => {
                result = result.replace(formatReg, fullTime[type])
            })
            return result
        } else {
            return ''
        }
    }
    before(value: number, type: RegionType) {
        const time = this.getRegion(value, type, 'reduce')?.toString()
        return new DateTime(time)
    }
    after(value: number, type: RegionType) {
        const time = this.getRegion(value, type, 'add')?.toString()
        return new DateTime(time)
    }
}
export default function dateTime(value?: string | number) {
    return new DateTime(value)
}