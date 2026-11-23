const c=require('@sparticuz/chromium');const p=require('puppeteer-core');const FAKE=require('./fake.js');
const FILE=process.argv[2];
(async()=>{const b=await p.launch({executablePath:await c.executablePath(),args:c.args,headless:true});
const pg=await b.newPage();await pg.setRequestInterception(true);
pg.on('request',r=>{const u=r.url(); if(u.startsWith('file:')) r.continue(); else r.abort();});
pg.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,160)));pg.on('dialog',d=>d.accept());
await pg.evaluateOnNewDocument(FAKE);
const load=async()=>{await pg.goto('file://'+FILE,{waitUntil:'load'});await new Promise(r=>setTimeout(r,900));};
const ev=(f,...a)=>pg.evaluate(f,...a);const wait=ms=>new Promise(r=>setTimeout(r,ms));
await load();
// PHONE: has its own settings + old failed attempts waiting
await ev(()=>{PROFILE.name='Phone Rachid';BW_LOG.push({date:'2026-11-17',w:84});localStorage.setItem('tr-profile-v1',JSON.stringify(PROFILE));localStorage.setItem('tr-bw-v1',JSON.stringify(BW_LOG));localStorage.setItem('tr-meta-dirty-v1',JSON.stringify({profile:'old1',bwLog:'old1',programs:'old1'}));localStorage.removeItem('tr-meta-v2');});
await load();await wait(600);
const srv=()=>ev(()=>{const m=JSON.parse(localStorage.getItem('FAKE_SRV')).meta;return m?JSON.stringify({name:m.profile?.name,bw:m.bwLog?.slice(-1)[0]?.w,keys:Object.keys(m).length}):'none';});
console.log('PHONE first open:',await ev(()=>_syncLabel),'| server settings',await srv());
await ev(()=>{DAY_OVERRIDES['2026-12-09']='PULL';saveDayOverrides();});await wait(400);
console.log('PHONE change:',await ev(()=>_syncLabel));
// SECOND DEVICE: same sync code, different stale settings and its own old failed attempts
await ev(()=>{const keep={FAKE_SRV:localStorage.getItem('FAKE_SRV'),id:localStorage.getItem('tr-trainer-id')};localStorage.clear();localStorage.setItem('FAKE_SRV',keep.FAKE_SRV);localStorage.setItem('tr-trainer-id',keep.id);localStorage.setItem('tr-profile-v1',JSON.stringify({name:'Laptop old'}));localStorage.setItem('tr-meta-dirty-v1',JSON.stringify({profile:'old2'}));});
await load();await wait(800);
console.log('DEVICE 2 open:',await ev(()=>_syncLabel+' | name '+PROFILE.name+' | override '+DAY_OVERRIDES['2026-12-09']),'| server',await srv());
await b.close();})().catch(e=>{console.log('ERR',e.message);process.exit(1)});
