const express = require('express');
const bodyParser = require('body-parser');
const cors = require('../middleware/cors');

const app = express();
app.use(bodyParser.json());
app.use(cors);

const wx = {
    appid: process.env.WX_APPID,
    secret: process.env.WX_SECRET
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '方法不允许' });
    }

    const code = req.body.code;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wx.appid}&secret=${wx.secret}&js_code=${code}&grant_type=authorization_code`;

    res.json({ /* 登录响应 */ });
};