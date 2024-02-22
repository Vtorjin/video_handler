class processManager {
    static instance: processManager | null = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new processManager();
        }
        return this.instance;
    }

    public app: any;
}

export default processManager;