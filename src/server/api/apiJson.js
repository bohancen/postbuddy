const fs = require('fs')

function get(obj,keys){
	if(typeof keys == 'number'){keys = keys+''}
	if(keys == undefined){return obj}
	
	if(!obj){
		return undefined
	}
  keys = keys.split('.')
  keys.forEach(function(key){
    if(obj && obj[key] != undefined){
      obj = obj[key]
    }else{
      obj = undefined
    }
  })
  return obj
}

module.exports=async function(req,res,next){
  if(req.url !== '/api/json'){
    return next()
  }
  res.set('Content-Type', 'application/json')
  let filePath = get(req,'files.file.path')||''
  let fileType = get(req,'files.file.type')||''
  if(fileType !== 'application/json'){
    return res.send('文件格式不正确')
  }
  let jsonString = fs.readFileSync(filePath,'utf8')
  try{
    fs.unlink(filePath,(err) => {
      if (err) throw err;
      console.log(filePath + '-文件已删除');
    })
  }catch(e){
    console.log(e)
  }
  return res.send(jsonString)
}
