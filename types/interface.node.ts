export interface errorMsg {
    message: string
    origin?: any
    stack: string
    name: string
    time: Date | string,
    type: "jsError" | "rejectionError"
}