const DB_NAME='MeuManhwaDB', DB_VERSION=1;
let dbPromise;

function openDB(){
  return dbPromise || (dbPromise=new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);

    r.onupgradeneeded=()=>{
      const d=r.result;
      ['works','posts','profile','settings'].forEach(s=>{
        if(!d.objectStoreNames.contains(s)){
          d.createObjectStore(s,{keyPath:'id'});
        }
      });
    };

    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  }));
}

async function dbPut(store,obj){
  const d=await openDB();
  return new Promise((res,rej)=>{
    const t=d.transaction(store,'readwrite');
    t.objectStore(store).put(obj);
    t.oncomplete=()=>res(obj);
    t.onerror=()=>rej(t.error);
  });
}

async function dbGetAll(store){
  const d=await openDB();
  return new Promise((res,rej)=>{
    const t=d.transaction(store,'readonly');
    const r=t.objectStore(store).getAll();
    r.onsuccess=()=>res(r.result||[]);
    r.onerror=()=>rej(r.error);
  });
}

async function dbGet(store,id){
  const d=await openDB();
  return new Promise((res,rej)=>{
    const r=d.transaction(store,'readonly').objectStore(store).get(id);
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}

async function dbDelete(store,id){
  const d=await openDB();
  return new Promise((res,rej)=>{
    const t=d.transaction(store,'readwrite');
    t.objectStore(store).delete(id);
    t.oncomplete=()=>res();
    t.onerror=()=>rej(t.error);
  });
}

async function saveFile(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result);
    r.onerror=()=>rej(r.error);
    r.readAsDataURL(file);
  });
}

/* =========================
   BACKUP
========================= */

async function exportBackup(){
  const backup={
    version:1,
    date:new Date().toISOString(),
    works:await dbGetAll('works'),
    posts:await dbGetAll('posts'),
    profile:await dbGetAll('profile'),
    settings:await dbGetAll('settings')
  };

  const blob=new Blob(
    [JSON.stringify(backup)],
    {type:'application/json'}
  );

  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');

  a.href=url;
  a.download='meu-manhwa-backup.json';
  a.click();

  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/* =========================
   RESTAURAR BACKUP
========================= */

async function importBackup(file){
  const text=await file.text();
  const backup=JSON.parse(text);

  if(!backup || backup.version!==1){
    throw new Error('Backup inválido ou incompatível.');
  }

  for(const item of (backup.works||[])){
    await dbPut('works',item);
  }

  for(const item of (backup.posts||[])){
    await dbPut('posts',item);
  }

  for(const item of (backup.profile||[])){
    await dbPut('profile',item);
  }

  for(const item of (backup.settings||[])){
    await dbPut('settings',item);
  }

  return true;
}

function esc(s=''){
  return String(s).replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[m]));
            }
