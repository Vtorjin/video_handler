
import OpenAi from "openai";
import { ClientOptions } from "openai";
import FileManager from "./fileManager";

export interface ChatItem {
    role: "user" | 'assistant'
    content: string
    time?: number
}

class ChatManager {
    static instance: ChatManager | null = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new ChatManager();
        }
        return this.instance;
    }

    private apiKey: string
    private apiUrl: string
    private openai: OpenAi;
    private chatHistory: ChatItem[]
    private chatSessionUnion: string[]

    constructor() {
        process.env['OPENAI_API_KEY'] = "";
        console.log(process.env, '初始化的时候')
        this.apiKey = FileManager.getInstance().getRelevantValue<'apiKey'>('apiKey');
        this.apiUrl = FileManager.getInstance().getRelevantValue<'apiUrl'>('apiUrl');
    }



    switchApiConf(k: "apiUrl" | "apiUrl", val: string) {
        this[k] = val;
    }

    switchChatHistory() {

    }

    init() {
        const conf: ClientOptions = {
            apiKey: this.apiKey,
            organization: null,
            baseURL: this.apiUrl,
            defaultHeaders: {},
            timeout: 120
        };
        this.openai = new OpenAi(conf);
    }

    sendMsg(content: string) {
        if (this.openai) {
            this.chatHistory.push({
                role: "user",
                content,
                time: Date.now()
            })
            this.openai.chat.completions.create({
                messages: [{ role: 'user', content: content }],
                model: 'gpt-3.5-turbo-1106',
            }).then(res => {
                this
            }).catch(err => {

            })
        } else {
            this.init();
        }
    }
}

export default ChatManager;