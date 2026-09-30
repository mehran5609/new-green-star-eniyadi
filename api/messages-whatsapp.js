const {db,json,requireAdmin}=require('./_lib');

function normalizeWhatsAppNumber(value){
  let n=String(value||'').replace(/\D/g,'');
  if(n.startsWith('00'))n=n.slice(2);
  if(n.startsWith('0'))n=n.slice(1);
  if(n.length===10)n=`91${n}`;
  return n;
}

module.exports=async function(req,res){
  if(!requireAdmin(req,res))return;
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  const token=process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId=process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version=process.env.WHATSAPP_API_VERSION||'v23.0';
  if(!token||!phoneNumberId)return json(res,500,{error:'WhatsApp sending is not configured'});
  try{
    const b=req.body||{};
    const body=String(b.body||'').trim();
    const audience=String(b.audience||'all');
    const month=String(b.month||'');
    if(!body)return json(res,400,{error:'Message is required'});
    if(body.length>4096)return json(res,400,{error:'Message is too long'});
    const client=db();
    const {data:members,error}=await client.from('members').select('id,name,mobile').eq('active',true);
    if(error)throw error;
    let selected=members||[];
    if(audience==='paid'||audience==='pending'){
      if(!/^\d{4}-\d{2}$/.test(month))return json(res,400,{error:'A valid payment month is required'});
      const {data:payments,error:pe}=await client.from('payments').select('member_id').eq('month',month);
      if(pe)throw pe;
      const paid=new Set((payments||[]).map(x=>x.member_id));
      selected=selected.filter(x=>audience==='paid'?paid.has(x.id):!paid.has(x.id));
    }
    if(audience==='selected'){
      const ids=Array.isArray(b.memberIds)?b.memberIds.map(String):[];
      selected=selected.filter(x=>ids.includes(String(x.id)));
    }
    const recipients=[...new Map(selected.map(m=>[normalizeWhatsAppNumber(m.mobile),m])).entries()].filter(([number])=>number.length>=10).map(([number,m])=>({number,name:m.name}));
    if(!recipients.length)return json(res,400,{error:'No valid WhatsApp numbers match this audience'});
    const url=`https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    const results=[];
    for(const recipient of recipients){
      const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',recipient_type:'individual',to:recipient.number,type:'text',text:{preview_url:false,body}})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data?.error?.message||'WhatsApp API rejected a message');
      results.push(data);
    }
    await client.from('messages').insert({subject:'WhatsApp broadcast',body,audience,recipients:recipients.length,sent_at:new Date().toISOString(),status:'sent'});
    return json(res,200,{ok:true,recipients:recipients.length,results});
  }catch(e){
    return json(res,500,{error:e.message||'WhatsApp sending failed'});
  }
}
