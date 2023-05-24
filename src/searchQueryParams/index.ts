export default function serchParams(k?: string) {
    if (!window) throw new Error('This function just use in browser environment')
    const result: Record<string, string> = {}
    const string = window.location.search.slice(1)
    if (!string) return {}
    const list = string.split('&')
    for (let i = 0; i < list.length; i++) {
        const arr = list[i].split('=')
        if (k && arr[0] === k) {
            return arr[1] || ''
        }
        result[arr[0]] = arr[1] || ''
    }
    return result
}