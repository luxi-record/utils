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
    if (isReduce) {
        const numberOne = Number(a), numberTwo = Number(b)
        const absNumberOne = a.replace('-', ''), absNumberTwo = b.replace('-', '')
        const hasMinusSign = (Math.abs(numberOne) > Math.abs(numberTwo) && numberOne < 0) || (Math.abs(numberTwo) > Math.abs(numberOne) && numberTwo < 0) ? true : false
        const length = absNumberOne.length
        const big = Math.abs(numberOne) > Math.abs(numberTwo) ? absNumberOne : absNumberTwo
        const small = Math.abs(numberOne) < Math.abs(numberTwo) ? absNumberOne : absNumberTwo
        for (let i = length - 1; i >= 0; i--) {
            const numberA = Number(big[i]), numberB = Number(small[i])
            const tmp = numberA - numberB - carry
            if (tmp < 0) {
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
        if (carry) resulet = carry + resulet
        resulet = isNegative ? `-${resulet}` : resulet
    }
    return resulet
}
export default function largeNumberAdd(num1: string, num2: string): string {
    let stringOne = String(num1), stringTwo = String(num2)
    const reg = /^(-?\d+)(\.\d+)?$/ // /^-?\d+$/ 整数 /^0+$/ 全零
    if (!reg.test(stringOne) || !reg.test(stringTwo)) {
        throw new Error('Please enter a string composed of numbers')
    }
    const stringOneLess = Number(stringOne) < 0 ? true : false
    const stringTwoLess = Number(stringTwo) < 0 ? true : false
    const isFloat = stringOne.includes('.') || stringTwo.includes('.')
    let pointIndex: number | null = null
    if (isFloat) {
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
    if (pointIndex) return `${result.slice(0, pointIndex)}.${result.slice(pointIndex)}`
    return result
}