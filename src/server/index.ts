import express from "express";
import request from "axios";
import https from 'https';
import { SocksProxyAgent } from 'socks-proxy-agent';

const agent = new SocksProxyAgent('socks5://localhost:11223');
const app = express();
const port = 8888;

app.use('/', (req, res) => {

    req.method.toLowerCase() === 'get' && https.get('https://ipinfo.io', { agent }, (_res) => {
        var chunk = '';
        _res.on('data', (data) => {chunk += data;})

        _res.on('data', (data) => { chunk += data; });
        _res.on('end', () => {
            res.send(chunk + 'sys')
        }).on('error', (e) => {
            console.log(e, '错误内容是')
            res.send(e)
        });
    })

    req.method.toLowerCase() === 'post' && res.send('time to let it go!')
})



app.listen(port, () => {
    console.log(`http://localhost:${port}启动成功!`)
})

