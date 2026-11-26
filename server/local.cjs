'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {promisify}=require('node:util'),scrypt=promisify(crypto.scrypt);
const ROOT=path.resolve(__dirname,'..'),MAX=2*1024*1024;
const userName=v=>typeof v==='string'&&/^[a-z0-9_]{3,24}$/.test(v);
const passwordOK=v=>typeof v==='string'&&v.length>=12&&v.length<=128;
const key=()=>crypto.randomBytes(32).toString('hex');
const hash=(password,salt)=>scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'};
function createServer({dataDir=path.join(os.homedir(),'.kingdom-of-ashes-dev')}={}){
 fs.mkdirSync(dataDir,{recursive:true,mode:0o700});const sessions=new Map(),attempts=new Map();
 const file=(name,type)=>path.join(dataDir,name+'.'+type+'.json');
 const read=(p)=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw e}};
 function atomic(p,v){const temp=p+'.'+key()+'.tmp';try{fs.writeFileSync(temp,JSON.stringify(v),{mode:0o600,flag:'wx'});fs.renameSync(temp,p)}finally{try{fs.unlinkSync(temp)}catch{}}}
 const cookie=(token,age=86400)=>'koa_session='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age='+age;
 function session(req){const token=(req.headers.cookie||'').match(/(?:^|;\s*)koa_session=([a-f0-9]{64})(?:;|$)/)?.[1],v=sessions.get(token);if(!v||v.expires<Date.now()){sessions.delete(token);return null}return {token,...v}}
 function body(req){return new Promise((resolve,reject)=>{let size=0,chunks=[];req.on('data',b=>{size+=b.length;if(size>MAX){chunks=[];reject(Object.assign(Error('too large'),{status:413}));return}chunks.push(b)});req.on('end',()=>{if(size>MAX)return;try{const v=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!v||typeof v!=='object'||Array.isArray(v))throw Error();resolve(v)}catch{reject(Object.assign(Error('invalid JSON'),{status:400}))}});req.on('error',reject)})}
 const validSave=v=>v&&typeof v==='object'&&!Array.isArray(v)&&Number.isSafeInteger(v.level)&&v.level>=1;
 return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');
  const json=(status,value)=>{if(res.writableEnded)return;res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value))};
  try{
   const host=req.headers.host||'';if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host))return json(403,{error:'local only'});
   if(req.headers.origin&&req.headers.origin!=='http://'+host)return json(403,{error:'origin'});
   const url=new URL(req.url,'http://'+host),p=url.pathname,method=req.method;
   if(p.startsWith('/api/')){
    if(method!=='GET'&&!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return json(415,{error:'JSON required'});
    if(p==='/api/status'&&method==='GET')return json(200,{mode:'local-development',multiplayer:false,payments:false});
    if((p==='/api/register'||p==='/api/login')&&method==='POST'){
     const now=Date.now();for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);const ip=req.socket.remoteAddress,lim=attempts.get(ip)||{n:0,until:now+60000};if(++lim.n>12)return json(429,{error:'try again later'});attempts.set(ip,lim);
     const v=await body(req),name=typeof v.username==='string'?v.username.toLowerCase():'',password=v.password;
     if(!userName(name)||!passwordOK(password))return json(400,{error:'invalid credentials format'});
     const fp=file(name,'account');let account=read(fp);
     if(p==='/api/register'){if(account)return json(409,{error:'username unavailable'});const salt=key(),digest=(await hash(password,salt)).toString('hex');try{fs.writeFileSync(fp,JSON.stringify({salt,digest}),{mode:0o600,flag:'wx'})}catch(e){if(e.code==='EEXIST')return json(409,{error:'username unavailable'});throw e}}
     else {const digest=await hash(password,account?.salt||'0'.repeat(64));if(!account||!crypto.timingSafeEqual(digest,Buffer.from(account.digest,'hex')))return json(401,{error:'invalid credentials'})}
     for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);const prior=session(req);if(prior)sessions.delete(prior.token);const token=key();sessions.set(token,{name,expires:now+86400000});res.setHeader('Set-Cookie',cookie(token));return json(200,{username:name})
    }
    const auth=session(req);if(!auth)return json(401,{error:'authentication required'});
    if(p==='/api/me'&&method==='GET')return json(200,{username:auth.name});
    if(p==='/api/logout'&&method==='POST'){sessions.delete(auth.token);res.setHeader('Set-Cookie',cookie('',0));return json(200,{ok:true})}
    if(p==='/api/save'&&method==='GET')return json(200,{backup:read(file(auth.name,'save'))});
    if(p==='/api/save'&&method==='PUT'){const v=await body(req);if(v.format!=='koa-offline-backup'||v.version!==1||!validSave(v.save))return json(400,{error:'invalid backup'});atomic(file(auth.name,'save'),v);return json(200,{ok:true})}
    return json(404,{error:'not found'})
   }
   if(method!=='GET'&&method!=='HEAD')return json(405,{error:'method'});
   const decoded=decodeURIComponent(p),rel=decoded==='/'?'preview/index.html':decoded==='/account'?'server/account.html':decoded==='/preview/'?'preview/index.html':decoded.slice(1);
   if(!/^(?:preview\/|assets\/)[a-zA-Z0-9_./-]+$/.test(rel)&&!['audio.js','server/account.html'].includes(rel))return json(404,{error:'not found'});
   const target=path.resolve(ROOT,rel);if(!target.startsWith(ROOT+path.sep)||rel.split('/').includes('..')||!fs.existsSync(target)||!fs.statSync(target).isFile()||!fs.realpathSync(target).startsWith(ROOT+path.sep))return json(404,{error:'not found'});
   res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});if(method==='HEAD')return res.end();fs.createReadStream(target).pipe(res)
  }catch(e){json(e.status||500,{error:e.status?e.message:'internal error'})}
 })
}
if(require.main===module){const port=Number(process.env.KOA_PORT||8787);createServer().listen(port,'127.0.0.1',()=>console.log('Local beta: http://127.0.0.1:'+port+'/preview/ · accounts: /account'))}
module.exports={createServer};
