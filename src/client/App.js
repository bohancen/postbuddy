import React, { Component, Fragment } from 'react';
import md5 from 'md5';
import axios from 'axios';
import clientAxios from './tools/client.axios';

class Pack extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    if(this.props.if === false){
      return null
    }
    const props = {...this.props,...{if:undefined}}
    return <div className={this.props.className} {...props}>
      {this.props.children}
    </div>
  }
}

window.md5 = md5
// console.log(md5('message'))
class App extends Component {
  constructor(props){
    super(props)
    let defauleState = {
      activeID:0,
      globleScript:'',
      // tabs[0]{
      //   id,
      //   script:''
      //   members: {
      //     url:'',
      //     method:'get',
      //     // headers,qs,form = {id,key,value,description}
      //     headers:[],
      //     qs:[],
      //     form:[],
      //   }
      // }
      tabs:[]
    }
    let localStorageState = null
    try{
      localStorageState = JSON.parse(localStorage.getItem('state'))
    }catch(e){console.log(e)}
    this.state = localStorageState || defauleState

    if(this.state.globleScript){
      this.event().runScript(this.state.globleScript)
    }
    this.state.tabs.forEach(tab => {
      if(tab.script){
        this.event().runScript(tab.script,tab.id)
      }
    })
    
    this.setStates=(state)=>{
      this.setState(state,function(){
        localStorage.setItem('state',JSON.stringify(this.state))
      })
    }

    function createBackground(){
      let canvas = document.createElement('canvas')
      canvas.width='1100'
      canvas.height='230'
      let context = canvas.getContext("2d");
      // 设置字体
      context.font = "italic 100px bold arial";
      // context.fontStyle = ''
      // context.fontFamily = 'arial'
      // 设置颜色
      context.fillStyle = "#ff0";
      // 设置水平对齐方式
      // context.textAlign = "center";
      // // 设置垂直对齐方式
      // context.textBaseline = "middle";
      // 绘制文字（参数：要写的字，x坐标，y坐标）
      context.fillText("postBuddy", 0, 100)
      context.fillText("postBuddy", 520, 200)
      return canvas.toDataURL()
    }
    this.backgroundImage = createBackground()
    
  }
  componentDidMount(){
  }
  event(){
    return {
      async send(){
        let {tabs,activeID} = this.state
        let option = tabs.reduce((pre,tab)=>{
          if(tab.id !== activeID){return pre}
          let {members} = tab
          let {url,method,headers,qs,form} = members
          headers = headers.reduce((pre,{key,value})=>{
            if(key){pre[key] = value}
            return pre
          },{})
          qs = qs.reduce((pre,{key,value})=>{
            if(key){pre[key] = value}
            return pre
          },{})
          form = form.reduce((pre,{key,value})=>{
            if(key){pre[key] = value}
            return pre
          },{})
          pre = {
            url,method,headers,qs,form
          }
          return pre
        },null)
        if(option === null){
          throw new Error('option error')
        }
        // globle script
        if(window[`script_globle`]){
          option = window[`script_globle`](option)
        }
        // self script
        if(window[`script_${activeID}`]){
          option = window[`script_${activeID}`](option)
        }
        // option.qs.ts = (new Date().getTime()/1000).toFixed(0)
        const [err,data] = await clientAxios(option)
        if(data){
          console.log(data)
          let stringData = ''
          if(typeof data === 'object'){
            stringData = JSON.stringify(data)
          }else{
            stringData = data
          }
          document.querySelector(`#result-${activeID}`).innerText = stringData
        }
        if(err){
          console.log(err)
        }
      },
      addTab(){
        let {tabs,activeID} = this.state
        let curTab = null
        for(let tab of tabs){
          if(tab.id == activeID){
            curTab = JSON.parse(JSON.stringify(tab))
            break
          }
        }
        let members = {
          url:'http://',
          method:'get',
          // headers,qs,form = {id,key,value,description}
          headers:[],
          qs:[],
          form:[],
        }
        let script = '';
        if(curTab){
          members = {...members,...curTab.members}
          script = curTab.script
        }
        let id = new Date().getTime()

        this.setStates({
          ...this.state,
          activeID:id,
          tabs:[
            ...this.state.tabs,
            {
              id,
              members,
              script,
            }
          ]
        })
      },
      delTab(id,e){
        let {tabs,activeID} = this.state
        tabs = tabs.reduce((pre,cur,index)=>{
          if(cur.id === id){
            if(index >0){
              activeID = tabs[index-1].id
            }
            if(index == 0){
              if(tabs.length>1){
                activeID = tabs[1].id
              }
            }
          }else{
            pre.push(cur)
          }
          return pre
        },[])
        // console.log(tabs)
        this.setStates({
          ...this.state,
          activeID,
          tabs,
        })
      },
      changeTab(activeID){
        this.setStates({
          ...this.state,
          activeID
        })
      },
      addTabMembers({memberskey}){
        let id = new Date().getTime()
        let {tabs,activeID} = this.state
        for(let tab of tabs){
          if(tab.id == activeID){
            tab.members[memberskey].push({id,key:'',value:'',description:''})
            break
          }
        }
        this.setStates({
          ...this.state,
          tabs
        })
      },
      delTabMembers({memberskey,id}){
        let {tabs,activeID} = this.state
        for(let tab of tabs){
          if(tab.id == activeID){
            tab.members[memberskey] = tab.members[memberskey].reduce((pre,cur)=>{
              if(cur.id !== id){
                pre.push(cur)
              }
              return pre
            },[])
            break
          }
        }
        this.setStates({
          ...this.state,
          tabs
        })
      },
      editTabMembers({memberskey,id,key,value,description},e){
        let targetVal = e.target.value
        let {tabs,activeID} = this.state
        for(let tab of tabs){
          if(tab.id == activeID){
            if(memberskey == 'url' || memberskey == 'method'){
              tab.members[memberskey] = targetVal
              break
            }
            for(let item of tab.members[memberskey]){
              if(item.id == id){
                if(key!==undefined){item.key = targetVal}
                if(value!==undefined){item.value = targetVal}
                if(description!==undefined){item.description = targetVal}
                break
              }
            }
            break
          }
        }
        this.setStates({
          ...this.state,
          tabs
        })
      },
      runScript(val,activeID){
        activeID = activeID || 'globle'
        // 创建脚本
        let eleScript = document.createElement('script')
        eleScript.innerHTML = `
          window['script_${activeID}']=function(req){
            ${val}
            return req
          }
        `
        document.body.appendChild(eleScript)
      },
      showScript(){
        let {tabs,activeID} = this.state
        for(let tab of tabs){
          if(tab.id == activeID){
            tab.show = !tab.show
            break
          }
        }
        this.setStates({
          ...this.state,
          tabs
        })
      },
      saveScript(){
        let {tabs,activeID} = this.state
        for(let tab of tabs){
          if(tab.id == activeID){
            let eleTextarea = document.querySelector(`#textarea_${activeID}`)
            let val = eleTextarea.value
            tab['script'] = val

            this.event().runScript(val,activeID)
            break
          }
        }
        this.setStates({
          ...this.state,
          tabs
        })
      },
      showGlobleScript(){
        let {showGlobleScript} = this.state
        showGlobleScript = !showGlobleScript
        this.setStates({
          ...this.state,
          showGlobleScript
        })
      },
      saveGlobleScript(){
        let globleScript = document.querySelector(`#textarea_globle`).value
        this.setStates({
          ...this.state,
          globleScript
        })
      },
      importConfig(){
        let f = document.createElement('input')
        f.type = 'file'
        let e = document.createEvent('MouseEvents')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        f.dispatchEvent(e)
        f.addEventListener('change',e=>{
          let file = e.target
          let file_data = file.files[0]
          let formdata = new FormData()
          formdata.append('file', file_data)
          axios({
            url:'/api/json',
            method:'post',
            data:formdata
          })
          .then(r=>{
            console.log(r.data)
            this.setStates(r.data)
            setTimeout(() => {
              window.location.reload()
            }, 100);
          })
          .catch(e=>{
            console.log(e)
          })
        })
      },
      exportConfig(){
        // let data = {config:"config"}
        let data = this.state
        let filename = 'config.json'
        if(!data) {
          alert('保存的数据为空');
          return;
        }
        if(!filename) 
          filename = 'json.json'
        if(typeof data === 'object'){
          data = JSON.stringify(data, undefined, 4)
        }
        var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
      }
    }
  }
  render() {
    // console.log(this.state)
    let {activeID,tabs,globleScript,showGlobleScript} = this.state
    return <div className="wrap">
      <div className="tabs">
        {
          tabs.map(({id,members},index)=>{
            return <div className={`tab ${id===activeID?'active':''}`} key={id}>
              <div onClick={this.event().changeTab.bind(this,id)} title={members.url}>{members.url}</div>
              <button className="btn btn-del" onClick={this.event().delTab.bind(this,id)}></button>
            </div>
          })
        }
        <button className="btn btn-add" onClick={this.event().addTab.bind(this)}></button>
      </div>
      <div className="body">
        {
          tabs.map(({members,id,script,show},index)=>{
            if(activeID !== id){return null}
            return <div key={id} className="page">
              {
                Object.keys(members).map((memberskey,index)=>{
                  let value = members[memberskey]
                  if(memberskey === 'url' || memberskey === 'method'){
                    return <div key={index} className="item">
                      <div className="key">{memberskey}</div>
                      <div className="values"><input className="input01" onChange={this.event().editTabMembers.bind(this,{memberskey})} defaultValue={value} type="text" /></div>
                    </div>
                  }

                  return <div key={index} className="item">
                    <div className="key">{memberskey}</div>
                    <div className="values">
                      {
                        value.map(({id,key,value,description})=>{
                          return <div className="flex" key={id}>
                            <div>key: <input onChange={this.event().editTabMembers.bind(this,{memberskey,id,key})} defaultValue={key} type="text"/></div>
                            <div>value: <input onChange={this.event().editTabMembers.bind(this,{memberskey,id,value})} defaultValue={value} type="text"/></div>
                            <div>description: <input onChange={this.event().editTabMembers.bind(this,{memberskey,id,description})} defaultValue={description} type="text"/></div>
                            <button className="btn btn-del" onClick={this.event().delTabMembers.bind(this,{memberskey,id})}></button>
                          </div>    
                        })
                      }
                      <div>
                        <button className="btn btn-add" onClick={this.event().addTabMembers.bind(this,{memberskey})}></button>
                      </div>
                    </div>
                    
                  </div>
                  
                })
              }
              <div>
                <div className="flex-center">
                  self-pre-request-script:
                  <button className="btn btn-show" onClick={this.event().showScript.bind(this)} title="show script"></button>
                  <button className="btn btn-save" onClick={this.event().saveScript.bind(this)} title="save script"></button>
                </div>
                <Pack if={!!show} className="flex-center">
                  <textarea className="textarea" id={`textarea_${activeID}`} defaultValue={script} cols="30" rows="10"></textarea>
                  <button className="btn btn-send" onClick={this.event().send.bind(this)} title="send"></button>
                </Pack>
              </div>
              <div>
                <div>result:</div>
                <div className="res-result" id={`result-${activeID}`}></div>
              </div>
            </div>
          })
        }
      </div>
      <div>
        <button onClick={this.event().exportConfig.bind(this)}>exportConfig</button>
        <button onClick={this.event().importConfig.bind(this)}>importConfig</button>
      </div>
      <div className="globle-script">
        <div className="flex-center flex-right">
          globle-pre-request-script:
          <button className="btn btn-show" onClick={this.event().showGlobleScript.bind(this)} title="show script"></button>
          <button className="btn btn-save" onClick={this.event().saveGlobleScript.bind(this)} title="save globle script"></button>
        </div>
        <Pack if={!!showGlobleScript} className="flex-center">
          <textarea className="textarea" id={`textarea_globle`} defaultValue={globleScript} cols="30" rows="10"></textarea>
        </Pack>
      </div>
      {/* <div className="background" style={{backgroundImage:`url(${this.backgroundImage})`}}></div> */}
    </div>
  }
}

export default App;
