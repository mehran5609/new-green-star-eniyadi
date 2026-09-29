const crypto=require('crypto');
const {createClient}=require('@supabase/supabase-js');

function db(){return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}})}
function json(res,status,data){res.status(status).json(data)}
function cookie(name,value,maxAge){return `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`}
function sign(value){return crypto.createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('hex')}
function makeSession(){const payload=Buffer.from(JSON.stringify({exp:Date.now()+1000*60*60*12})).toString('base64url');return `${payload}.${sign(payload)}`}
function validSession(req){const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('ngs_session='));if(!raw)return false;const token=raw.slice(12);const [payload,mac]=token.split('.');if(!payload||!mac)return false;const expected=sign(payload);if(mac.length!==expected.length)return false;if(!crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return false;try{return JSON.parse(Buffer.from(payload,'base64url').toString()).exp>Date.now()}catch{return false}}
function requireAdmin(req,res){if(!validSession(req)){json(res,401,{error:'Unauthorized'});return false}return true}
function monthNow(){const d=new Date();return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`}
module.exports={db,json,cookie,makeSession,validSession,requireAdmin,monthNow}
