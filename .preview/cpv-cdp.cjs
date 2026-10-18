const {spawn}=require('node:child_process'); const fs=require('node:fs'); const os=require('node:os'); const path=require('node:path');
class Browser {
 async open(){this.proc=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-gpu-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required','--remote-debugging-pipe','--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'cpv-intro-'))],{stdio:['ignore','ignore','pipe','pipe','pipe']});this.pending=new Map();this.id=0;this.buffer='';this.events=[];this.proc.stdio[4].on('data',b=>{this.buffer+=b;let n;while((n=this.buffer.indexOf('\0'))>=0){const msg=JSON.parse(this.buffer.slice(0,n));this.buffer=this.buffer.slice(n+1);if(msg.id){let p=this.pending.get(msg.id);this.pending.delete(msg.id);msg.error?p?.reject(new Error(JSON.stringify(msg.error))):p?.resolve(msg.result);}else{this.events.push(msg);this.onEvent?.(msg);}}});const t=await this.send('Target.createTarget',{url:'about:blank'});this.session=(await this.send('Target.attachToTarget',{targetId:t.targetId,flatten:true})).sessionId;await this.send('Page.enable',{},this.session);await this.send('Runtime.enable',{},this.session);return this;}
 send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.proc.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');});}
 call(m,p={}){return this.send(m,p,this.session)}
 async eval(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
 async wait(expression,ms=12000){const end=Date.now()+ms;while(Date.now()<end){if(await this.eval(expression))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Timeout '+expression)}
 async shot(file){const r=await this.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
 close(){this.proc.kill();}
}
module.exports={Browser};
if(require.main===module)(async()=>{const b=await new Browser().open();try{console.log(await b.eval('navigator.userAgent'));}finally{b.close();}})();
