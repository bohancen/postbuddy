import axios from 'axios';

// 抽离成公共方法
const awaitWrap = promise => {
  return promise
    .then(data => [null, data.data])
    .catch(err => [err, null])
}

function clientAxios(data){
  let defaultConfig = {url:'/api',method:'post'}
  let config = {
    ...defaultConfig,
    data
  }
  return awaitWrap(axios({
    ...config
  }))
}

export default clientAxios