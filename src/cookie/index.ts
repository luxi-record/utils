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