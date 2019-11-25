const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

const view = require('./tpl/index')
const api = require('./api/index')
const apiJson = require('./api/apiJson')


// 监听端口
const PORT = process.env.PORT || 6789
const app = express()
app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(multipartMiddleware)
app.use(`/static`, express.static(path.join(__dirname, '../../static')))
app.use(`/favicon.ico`, express.static(path.join(__dirname, '../../favicon.ico')))
app.use(view)
app.use(api)
app.use(apiJson)

app.listen(PORT,function(){
  console.log(PORT)
})