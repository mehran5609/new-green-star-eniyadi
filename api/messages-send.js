const nodemailer=require('nodemailer');
const {db,json,requireAdmin}=require('./_lib');
module.exports=async function(req,res){
  if(!requireAdmin(req,res))return;
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  if(!process.env.GMAIL_USER||!process.env.GMAIL_APP_PASSWORD)return json(res,500,{error:'Gmail sending is not configured'});
  try{
    const b=req.body||{};const subject=String(b.subject||'').trim(),body=String(b.body||'').trim(),audience=String(b.audience||'all');
    if(!subject||!body)return json(res,400,{error:'Subject and message are required'});
    const client=db();const {data:members,error}=await client.from('members').select('id,name,email').eq('active',true);if(error)throw error;
    const month=String(b.month||'');let selected=members||[];
    if(audience==='paid'||audience==='pending'){
      if(!/^\d{4}-\d{2}$/.test(month))return json(res,400,{error:'A valid payment month is required'});
      const {data:payments,error:pe}=await client.from('payments').select('member_id').eq('month',month);if(pe)throw pe;const paid=new Set((payments||[]).map(x=>x.member_id));selected=selected.filter(x=>audience==='paid'?paid.has(x.id):!paid.has(x.id));
    }
    if(audience==='selected'){
      const ids=Array.isArray(b.memberIds)?b.memberIds.map(String):[];selected=selected.filter(x=>ids.includes(String(x.id)));
    }
    const emails=[...new Set(selected.map(x=>x.email).filter(Boolean))];if(!emails.length)return json(res,400,{error:'No member email addresses match this audience'});
    const transporter=nodemailer.createTransport({service:'gmail',auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}});
    await transporter.sendMail({from:process.env.CLUB_EMAIL_FROM||process.env.GMAIL_USER,to:process.env.GMAIL_USER,bcc:emails,subject,text:body});
    await client.from('messages').insert({subject,body,audience,recipients:emails.length,sent_at:new Date().toISOString(),status:'sent'});
    return json(res,200,{ok:true,recipients:emails.length});
  }catch(e){return json(res,500,{error:e.message||'Message sending failed'})}
}
