function getSelectors(path: [HTMLElement | Document | Window] | HTMLElement[]): string {
    return (path.reverse().filter(element => {
        return element !== document && element !== window;
    }) as HTMLElement[]).map(element => {
        let selector = "";
        if (element.id) {
            return `${element.nodeName.toLowerCase()}#${element.id}`;
        } else if (element.className && typeof element.className == 'string') {
            return `${element.tagName.toLowerCase()}.${element.className}`
        } else {
            selector = element.nodeName.toLowerCase();
        }
        return selector;
    }).join('>');
}


export default function (pathsOrTarget: HTMLElement | [HTMLElement | Document | Window]) {
    if (Array.isArray(pathsOrTarget)) {
        //可能是一个数相 
        return getSelectors(pathsOrTarget);
    } else {
        //也有可有是一个对象
        let path: HTMLElement[] = [];
        while (pathsOrTarget != null) {
            let el = pathsOrTarget as HTMLElement;
            path.push(el);
            if (pathsOrTarget !== null) {
                pathsOrTarget = el.parentNode as HTMLElement;
            } else {
                break;
            }
        }
        return getSelectors(path);
    }

}

