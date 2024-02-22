class TaskPoolManager {
    static instance: TaskPoolManager | null = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new TaskPoolManager();
        }
        return this.instance;
    }
    private max: number
    private fn: (t: any) => Promise<any>
    private pool: Promise<any>[]
    private tasks: any[]
    private finishFn: Function

    constructor() {
        this.max = 1;
        this.fn = () => Promise.resolve();
        this.pool = []
        this.tasks = []
        this.finishFn = () => { }
    }

    // 1st 
    start(tasks: string[], fn: (t: string) => Promise<any>, finishFn: Function) {

        this.fn = fn;
        this.finishFn = finishFn;
        this.tasks = tasks;

        // 1. 循环把并发池塞满
        while (this.pool.length < this.max) {
            let task = this.tasks.shift();
            this.insertTaskToTool(task)
        }

        // 2. 执行线程池,将最快执行的结果输出后开始生效的任务
        let race = Promise.race(this.pool);
        this.run(race);
    }

    insertTaskToTool(t: string) {
        if (!t) return;
        let task = this.fn(t);
        this.pool.push(task) //推入任务
        task.then(res => {

            // 任务结束后推出
            this.pool.splice(this.pool.indexOf(task), 1);

            // console.log(`当前的任务结束== ${t} ===end; 执行结果${res} === 剩下的任务数量是:${this.tasks.length}`)
        })
    }

    run(race: Promise<any>) {
        race.then(res => {
            //当线程池里面的任务有结束的时候,塞入下一个任务
            let t = this.tasks.shift();
            this.insertTaskToTool(t);

            if (this.pool.length) {
                // 继续等待并处理下一次任务的结果
                let nextRace = Promise.race(this.pool);
                this.run(nextRace);
            } else {
                console.log('所有的任务都已结束卡')
                this.finishFn();
            }

        })
    }

}

export default TaskPoolManager;