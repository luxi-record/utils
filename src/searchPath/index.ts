/*
    ** 一棵多叉树的路径搜索
    ** 回溯法
*/
export default function searchPathFromTree(tree: Record<string, any>, key: string, value: string | number | boolean | null, childKey: string = 'child'): any[] {
    const path = []
    let resulet: any[] = []
    path.push(tree[key])
    if (tree[key] === value) return path
    const child = tree[childKey]
    const traverse = (data: any[], path: any[], key: string, value: string | number | boolean | null, childKey: string = 'child') => {
        if (!data.length) return
        for (let tree of data) {
            path.push(tree[key])
            if (tree[key] === value) {
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