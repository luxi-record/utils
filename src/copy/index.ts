/*
    ** copy复制
    ** @params val复制的文本
    ** @return 复制成功与否
*/
export default function copy(val: string): boolean {
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