const {json,cookie,makeSession}=require('./_lib');
module.exports=async function(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  if(!process.env.ADMIN_PASSWORD||!process.env.SESSION_SECRET)return json(res,500,{error:'Server authentication is not configured'});
  const password=String((req.body||{}).password||'');
  if(password!==process.env.ADMIN_PASSWORD)return json(res,401,{error:'Incorrect password'});
  res.setHeader('Set-Cookie',cookie('ngs_session',makeSession(),60*60*12));
  return json(res,200,{ok:true});
}
