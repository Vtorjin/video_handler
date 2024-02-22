export default function getLines(stack: string) {
    return typeof stack == 'string' ? stack.split('\n').slice(1).map(item => item.replace(/^\s+at\s/g, '')).join('\n') : ""
}