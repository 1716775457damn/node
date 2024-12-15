const express = require('express');
const bodyParser = require('body-parser');
const cors = require('../middleware/cors');

const app = express();
app.use(bodyParser.json());
app.use(cors);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '方法不允许' });
    }

    const { token, userInfo } = req.body;

    // 这里需要实现用户信息存储逻辑
    // 建议使用 MongoDB 或其他数据库存储用户信息

    res.json({ success: true });
};