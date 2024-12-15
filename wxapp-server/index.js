const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

// 使用body-parser中间件
app.use(bodyParser.json())

// 配置小程序信息
const wx = {
    appid: '你的小程序appid',
    secret: '你的小程序secret'
}

// 模拟数据库
const db = {
    session: {},
    user: {}
}

// 登录接口
app.post('/login', (req, res) => {
    const code = req.body.code
    const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' +
        wx.appid + '&secret=' + wx.secret + '&js_code=' + code +
        '&grant_type=authorization_code'

    request(url, (err, response, body) => {
        if (err) {
            res.json({ error: err })
            return
        }

        const session = JSON.parse(body)
        if (session.openid) {
            const token = 'token_' + new Date().getTime()
            db.session[token] = session
            res.json({ token: token })
        } else {
            res.json({ error: '登录失败' })
        }
    })
})

// 检查登录状态接口
app.get('/checklogin', (req, res) => {
    const token = req.query.token
    if (db.session[token]) {
        res.json({ is_login: true })
    } else {
        res.json({ is_login: false })
    }
})

// 获取用户信息接口
app.post('/user/info', (req, res) => {
    const token = req.body.token
    const userInfo = req.body.userInfo

    if (db.session[token]) {
        const openid = db.session[token].openid
        db.user[openid] = userInfo
        res.json({ success: true })
    } else {
        res.json({ error: '未登录' })
    }
})

app.listen(3000, () => {
    console.log('服务器运行在 http://127.0.0.1:3000')
})