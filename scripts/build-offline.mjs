import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const base=process.env.BASE_PATH||'';
const buildId=(await readFile('.next/BUILD_ID','utf8')).trim();
const paths=[];
async function walk(folder){
  for(const entry of await readdir(folder,{withFileTypes:true})){
    const path=join(folder,entry.name);
    if(entry.isDirectory()){await walk(path);continue}
    const relative=path.replaceAll('\\','/').replace(/^out\//,'');
    if(relative.startsWith('_next/static/')&&/\.(js|css|woff2)$/.test(relative)||/\.(html|txt|png|svg|webmanifest)$/.test(relative)||relative==='exchange-rates.json')paths.push(base+'/'+relative.replace(/index\.html$/,''));
  }
}
await walk('out');
const source=`const CACHE=${JSON.stringify('calcpilot-'+buildId)};
const FILES=${JSON.stringify([...new Set(paths)])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('calcpilot-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(${JSON.stringify(base+'/')}))return;
  const key=url.origin+url.pathname;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&FILES.includes(url.pathname)){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,copy)))}
    return response;
  }).catch(async()=>{
    const cache=await caches.open(CACHE),saved=await cache.match(key,{ignoreSearch:true});
    if(saved)return saved;
    if(event.request.mode==='navigate')return await cache.match(${JSON.stringify(base+'/404/')})||Response.error();
    return Response.error();
  }));
});
`;
await writeFile('out/sw.js',source);
console.log('Offline worker generated for '+paths.length+' local resources');