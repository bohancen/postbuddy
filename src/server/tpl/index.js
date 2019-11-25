const env = process.env.NODE_ENV || 'development'

module.exports=function(req,res,next){
  // console.log(Object.keys(req))
  // console.log(req.baseUrl)
  // console.log(req._parsedUrl)
  // console.log(req.originalUrl)
  if(req.url !== '/'){
    return next()
  }
  
  // console.log(req.url)
  const tp =  `
  <!DOCTYPE html>
  <head>
    <title>postBuddy</title>
    <link href="/static/css/style.css" rel="stylesheet">
  </head>
  <body">
    <div id="root"></div>
  </body>
  <script src="/static/js/polyfill.7.2.5.min.js"></script>
  <script src="/static/js/index.${env}.js"></script>
  </html>
  `
  return res.send(tp)
}