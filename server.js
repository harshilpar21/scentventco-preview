const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const PORT = process.env.PORT || 3000;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, {recursive:true});
for (const name of ['products','blogs','leads']) { const f=path.join(DATA, name+'.json'); if(!fs.existsSync(f)) fs.writeFileSync(f,'[]'); }
function read(name){try{return JSON.parse(fs.readFileSync(path.join(DATA,name+'.json'),'utf8'))}catch{return []}}
function write(name,value){fs.writeFileSync(path.join(DATA,name+'.json'),JSON.stringify(value,null,2))}
function send(res,status,type,body){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(body)}
function json(res,status,obj){send(res,status,'application/json; charset=utf-8',JSON.stringify(obj))}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})})}
function routeApi(req,res,url){
  const parts=url.pathname.split('/').filter(Boolean); const resource=parts[1]; const id=parts[2];
  if(!['products','blogs','leads'].includes(resource)) return json(res,404,{error:'Not found'});
  const arr=read(resource);
  if(req.method==='GET') return json(res,200,arr);
  if(req.method==='POST') return body(req).then(data=>{const item={...data,id:data.id||crypto.randomUUID(),createdAt:data.createdAt||Date.now()};arr.unshift(item);write(resource,arr);json(res,201,item)}).catch(()=>json(res,400,{error:'Invalid JSON'}));
  if(req.method==='PUT' && id) return body(req).then(data=>{const i=arr.findIndex(x=>x.id===id);if(i<0)return json(res,404,{error:'Not found'});arr[i]={...arr[i],...data,id};write(resource,arr);json(res,200,arr[i])}).catch(()=>json(res,400,{error:'Invalid JSON'}));
  if(req.method==='DELETE' && id){const next=arr.filter(x=>x.id!==id);write(resource,next);return json(res,200,{ok:true})}
  return json(res,405,{error:'Method not allowed'});
}
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  if(url.pathname.startsWith('/api/')) return routeApi(req,res,url);
  let file=decodeURIComponent(url.pathname); if(file==='/'||file==='')file='/index.html'; file=path.normalize(file); if(file.includes('..'))return send(res,403,'text/plain','Forbidden');
  const full=path.join(ROOT,file); if(!fs.existsSync(full)||fs.statSync(full).isDirectory())return send(res,404,'text/plain','Not found');
  const ext=path.extname(full).toLowerCase(); send(res,200,MIME[ext]||'application/octet-stream',fs.readFileSync(full));
});
server.listen(PORT,()=>console.log(`Scentvent Co. running at http://localhost:${PORT}`));
