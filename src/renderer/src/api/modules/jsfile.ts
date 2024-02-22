import { ResultData } from "../interface"


export const getJsList = async () => {
    let res: ResultData<JSFile.JSEdit[]> = await fetch(`http://localhost:3880/angular/js/list`).then(r => r.json());
    return res.data;
}

export const getJsFile = (suffix: string) => {
    return fetch(`http://localhost:3880/angular/info/${suffix}`).then(r => r.json())
}

export const udpJsFile = (id: string, body: JSFile.JSEdit): Promise<ResultData<string>> => {
    return fetch(`http://localhost:3880/angular/js/${id}`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(body)
    }).then(res => (res.json()))
}

export const deleteFileApi = (id: string) => {
    return fetch(`http://localhost:3880/angular/d/${id}`).then(r => r.json())
}

export const addFile = (body: JSFile.Add): Promise<ResultData<string>> => {
    let query = Object.create(null);
    for (var key in body) {
        if (key === 'id') {
            continue;
        } else {
            query[key] = body[key];
        }
    }
    return fetch(`http://localhost:3880/video/setting`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(query)
    }).then(res => (res.json()))
}

export const addTag = (body: JSFile.TagsForm) => {
    delete body.id;
    return fetch(`http://localhost:3880/angular/type`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(body)
    }).then(res => (res.json()))
}