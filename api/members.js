const {db,json,requireAdmin}=require('./_lib');
module.exports=async function(req,res){
  if(!requireAdmin(req,res))return;
  const client=db();
  try{
    if(req.method==='GET'){
      const {data,error}=await client.from('members').select('*').eq('active',true).order('name');
      if(error)throw error;return json(res,200,{members:data||[]});
    }
    if(req.method==='POST'){
      const b=req.body||{};const name=String(b.name||'').trim(),role=String(b.role||'').trim(),mobile=String(b.mobile||'').trim(),email=String(b.email||'').trim().toLowerCase();
      if(!name||!role||!mobile||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json(res,400,{error:'Name, role, mobile and a valid email are required'});
      const {data,error}=await client.from('members').insert({name,role,mobile,email}).select('*').single();if(error)throw error;return json(res,201,{member:data});
    }
    if(req.method==='DELETE'){
      const id=String(req.query.id||'');if(!id)return json(res,400,{error:'Member id is required'});
      const {error}=await client.from('members').update({active:false}).eq('id',id);if(error)throw error;return json(res,200,{ok:true});
    }
    return json(res,405,{error:'Method not allowed'});
  }catch(e){return json(res,500,{error:e.message||'Member operation failed'})}
}
