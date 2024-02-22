import { ResultData } from "../interface"

export const getAppConf = async () => {
    const res: ResultData<ConfigItem[]> = await fetch(`http://localhost:3880/angular/config`).then(r => r.json())
    return res.data || [];
}
