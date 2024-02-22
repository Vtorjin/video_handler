export interface errorMsg {
    message: string
    origin?: any
    stack: string
    name: string
    time: Date
}

export interface RestfulResponse {
    code: number
    msg: string
    data: any
}


