const isAsync = fn => fn.constructor.name === "AsyncFunction";

class Bootstrap {
    taskList = []
    /**
     * 
     * @param {async ()=>void} taskFn 
     */
    addTask(taskFn) {
        if (!taskFn) return;
        this.taskList.push(taskFn);
        return this;
    }
    async init() {
        console.info('Bootstrap: started');
        const result = await Promise.all(this.taskList.map(fn => fn()));
        console.info('Bootstrap: finished');
        return this;
    }
}

export const bootstrapAPI = new Bootstrap();