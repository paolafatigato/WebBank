/* script.js - shared script e DB locale */
const STORAGE_KEY = 'schoolledger_db_v1';

/* Seed di esempio con i tuoi alunni della 1A (pochi) */
const seedDB = {
  classes: {
    "1A": {
      cols: [], // colonne transazioni (ogni col ha id,label)
      students: [
        { id: 'FF:0F:2A:6F:51:01:00', name: 'ALLMETA REINA', transactions: [5.00, -1.50] },
        { id: 'FF:0F:2B:6F:51:01:00', name: 'ATANASOVA BARBARA', transactions: [2.00] },
        { id: 'FF:0F:2C:6F:51:01:00', name: 'BANCE AIDA', transactions: [] },
        { id: 'FF:0F:29:6F:51:01:00', name: 'BENTIVOGLIO ANITA', transactions: [10.00, -3.00] },
        { id: 'FF:0F:28:6F:51:01:00', name: 'BONGIORNI EMMA', transactions: [] },
        { id: 'FF:0F:8C:70:51:01:00', name: 'BUTT IFFAH', transactions: [] },
        { id: 'FF:0F:8D:70:51:01:00', name: 'CARDENAS ZAMBRANO OLIVIA', transactions: [] },
        { id: 'FF:0F:8B:70:51:01:00', name: 'CAVANNA OLIVIA', transactions: [] },
        { id: 'FF:0F:8A:70:51:01:00', name: 'CECI MENDOZA BRENDA', transactions: [] },
        { id: 'FF:0F:89:70:51:01:00', name: 'DEMTI THIAGO', transactions: [] },
        { id: 'FF:0F:88:70:51:01:00', name: 'DEPPIERI NOEMI', transactions: [] },
        { id: 'FF:0F:87:70:51:01:00', name: 'ELASHAWAMI MARIHAN', transactions: [] },
        { id: 'FF:0F:86:70:51:01:00', name: 'ELDERDAH BASSAM MOHAMED', transactions: [] },
        { id: 'FF:0F:85:70:51:01:00', name: 'KELLY ROSEMOND DEBRAH', transactions: [] }
      ]
    }
  }
};

/* Load / Save DB */
function loadDB(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) {
      // seed initial DB and store
      saveDB(seedDB);
      return JSON.parse(JSON.stringify(seedDB));
    }
    return JSON.parse(raw);
  }catch(e){
    console.error('loadDB error', e);
    return JSON.parse(JSON.stringify(seedDB));
  }
}
function saveDB(db){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* small helpers */
function normalizeId(id){ return (id||'').toString().replace(/[^A-Za-z0-9]/g,'').toUpperCase(); }
function parseFloatOrNull(s){
  if(s===null||s===undefined) return null;
  const t = String(s).trim().replace(',','.');
  if(t==='') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
function sumArray(arr){
  if(!arr || !arr.length) return 0;
  let s = 0;
  for(let i=0;i<arr.length;i++){
    const v = parseFloat(arr[i]);
    if(Number.isFinite(v)) s += v;
  }
  return Math.round(s*100)/100;
}

/* small utilities used by pages */
window.loadDB = loadDB;
window.saveDB = saveDB;
window.normalizeId = normalizeId;
window.parseFloatOrNull = parseFloatOrNull;
window.sumArray = sumArray;

/* optional: try to setup Web NFC read to open student URL (only Chrome Android) */
async function enableNFCOpen(){
  if(!('NDEFReader' in window)) return;
  try{
    const reader = new NDEFReader();
    await reader.scan();
    reader.onreading = (e) => {
      for(const record of e.message.records){
        if(record.recordType === 'url' || record.recordType === 'text'){
          let text = '';
          try{
            if(record.data instanceof ArrayBuffer) text = new TextDecoder().decode(record.data);
            else text = record.data || '';
          }catch(err){ text = ''; }
          if(!text) continue;
          // if url contains ?id= open
          if(text.indexOf('?id=') !== -1) location.href = text;
          // if text looks like an id open current host student page
          if(/^[0-9A-Fa-f:]{6,}$/.test(text)) {
            const base = location.origin + location.pathname.replace(/[^\/]*$/, '');
            location.href = base + 'student.html?id=' + encodeURIComponent(text);
          }
        }
      }
    };
    console.log('Web NFC attivo');
  }catch(e){
    console.log('Web NFC non avviato:', e);
  }
}
// optional auto-enable on pages
enableNFCOpen();

// === API CONFIG ===
const API_BASE = 'https://script.google.com/macros/s/AKfycbx...../exec'; // la tua Web App URL
const API_TOKEN = 'CHANGE_ME_OPTIONAL'; // se usi SHARED_TOKEN nel backend

async function apiGet(params) {
  const url = new URL(API_BASE);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  if (API_TOKEN) url.searchParams.set('token', API_TOKEN);
  const r = await fetch(url.toString(), { method: 'GET' });
  return r.json();
}

async function apiPost(payload) {
  const body = API_TOKEN ? {...payload, token: API_TOKEN} : payload;
  const r = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}
