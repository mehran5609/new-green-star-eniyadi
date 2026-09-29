const {db,json,requireAdmin}=require('./_lib');
module.exports=async function(req,res){
  if(!requireAdmin(req,res))return;
  const client=db();
  try{
    if(req.method==='GET'){
      const month=String(req.query.month||'');if(!/^\d{4}-\d{2}$/.test(month))return json(res,400,{error:'Valid month is required'});
      const {data,error}=await client.from('payments').select('id,member_id,month,amount,paid_at').eq('month',month);if(error)throw error;return json(res,200,{payments:data||[]});
    }
    if(req.method==='PUT'){
      const b=req.body||{};const memberId=String(b.memberId||''),month=String(b.month||''),paid=Boolean(b.paid),amount=Number(b.amount||0);
      if(!memberId||!/^(\d{4})-(\d{2})$/.test(month))return json(res,400,{error:'Member and month are required'});
      if(paid){const {data,error}=await client.from('payments').upsert({member_id:memberId,month,amount,paid_at:new Date().toISOString()},{onConflict:'member_id,month'}).select('*').single();if(error)throw error;return json(res,200,{payment:data})}
      const {error}=await client.from('payments').delete().eq('member_id',memberId).eq('month',month);if(error)throw error;return json(res,200,{ok:true});
    }
    return json(res,405,{error:'Method not allowed'});
  }catch(e){return json(res,500,{error:e.message||'Payment operation failed'})}
}
