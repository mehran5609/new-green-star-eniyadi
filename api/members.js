const {db,json,requireAdmin}=require('./_lib');
module.exports=async function(req,res){
  if(!requireAdmin(req,res))return;
  const client=db();
  try{
    if(req.method==='GET'){
      const {data,error}=await client.from('members').select('*').eq('active',true).order('name');
      if(error)throw error;
      return json(res,200,{members:data||[]});
    }

    if(req.method==='POST'){
      const b=req.body||{};
      const name=String(b.name||'').trim();
      const role=String(b.role||'').trim();
      const mobile=String(b.mobile||'').trim();
      const photo_url=b.photo_url?String(b.photo_url):null;

      if(!name||!role||!mobile){
        return json(res,400,{error:'Name, role and mobile are required'});
      }

      if(photo_url&&(!photo_url.startsWith('data:image/')||photo_url.length>700000)){
        return json(res,400,{error:'Invalid or oversized member photo'});
      }

      const {data,error}=await client.from('members').insert({
        name,
        role,
        mobile,
        photo_url
      }).select('*').single();

      if(error)throw error;
      return json(res,201,{member:data});
    }

    if(req.method==='DELETE'){
      const id=String(req.query.id||'');
      if(!id)return json(res,400,{error:'Member id is required'});
      const {error}=await client.from('members').update({active:false}).eq('id',id);
      if(error)throw error;
      return json(res,200,{ok:true});
    }

    return json(res,405,{error:'Method not allowed'});
  }catch(e){
    return json(res,500,{error:e.message||'Member operation failed'});
  }
}
