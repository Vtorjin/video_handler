class Subscriber {
    public name: string = "";
    public cb: Function = () => { }
    constructor(name: string, cb: Function) {
        this.name = name;
        this.cb = cb;
    }
    update(...args) {
        this.cb.call(null, ...args);
    }
}

class MessageManager {
    static instance: null | MessageManager = null;
    static getInstance() {
        if (!this.instance) {
            this.instance = new MessageManager();
        }
        return this.instance
    }

    listeners: Record<string, Subscriber[]>

    constructor() {
        this.listeners = {}
    }

    sub(tag: string, cb: Function, name: string) {
        this.listeners[tag] = this.listeners[tag] || [];
        if (this.listeners[tag].findIndex((subscriber) => subscriber.name === name) !== -1) return;
        this.listeners[tag].push(new Subscriber(name, cb));
        console.log(cb.name, name, '注册成功')
    }

    pub(message) {
        var me = this;
        const { category, data, msgName } = message;
        const cbQueue = me.listeners[category];
        if (!cbQueue || !cbQueue?.length) return;
        let len = cbQueue.length;
        len !== 0 && Object.values(cbQueue).forEach(cb => {
            cb.name === msgName && cb.update(data, msgName);
        })
    }

    off(tag, name) {
        if (!Array.isArray(this.listeners[tag])) return;
        if (this.listeners[tag].length == 0) {
            delete this.listeners[tag];
            return;
        }
        let idx = this.listeners[tag].findIndex(n => n.name == name);
        idx !== -1 && this.listeners[tag].splice(idx, 1);
    }
}

export default MessageManager;