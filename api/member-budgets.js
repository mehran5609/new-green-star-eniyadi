const SUPABASE_URL=process.env.SUPABASE_URL;
const SERVICE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(res,status,body){
  res.status(status).setHeader('Content-Type','application/json');
  return res.end(JSON.stringify(body));
}

function cookie(req){
  return req.headers.cookie||'';
}

function isAdmin(req){
  const c=cookie(req);
  return c.includes('admin_session=')||c.includes('ngs_admin_session=')||c.includes('adminSession=');
}

async function sb(path,options={}){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    ...options,
    headers:{
      apikey:SERVICE_KEY,
      Authorization:`Bearer ${SERVICE_KEY}`,
      'Content-Type':'application/json',
      Prefer:'return=representation',
      ...(options.headers||{})
    }
  });

  const text=await r.text();
  let data={};

  try{
    data=text?JSON.parse(text):{};
  }catch{
    data={error:text};
  }

  if(!r.ok){
    throw new Error(
      data.message||
      data.error_description||
      data.hint||
      data.error||
      'Supabase request failed'
    );
  }

  return data;
}

module.exports=async function handler(req,res){
  if(!isAdmin(req)){
    return json(res,401,{error:'Admin login required'});
  }

  try{
    if(req.method==='GET'){
      const rows=await sb(
        'member_extra_budgets?select=*&order=created_at.desc'
      );

      return json(res,200,{extraDues:rows});
    }

    if(req.method==='POST'){
      const b=req.body||{};

      const memberId=String(b.memberId||'').trim();
      const reason=String(b.reason||'').trim();
      const total=Number(b.totalAmount);
      const paid=Number(b.paidAmount||0);

      if(!memberId||!reason){
        return json(res,400,{
          error:'Member and reason are required'
        });
      }

      if(
        !Number.isFinite(total)||
        total<0||
        !Number.isFinite(paid)||
        paid<0||
        paid>total
      ){
        return json(res,400,{
          error:'Paid amount must be between ₹0 and the total amount'
        });
      }

      const rows=await sb(
        'member_extra_budgets',
        {
          method:'POST',
          body:JSON.stringify({
            member_id:memberId,
            reason:reason,
            total_amount:total,
            paid_amount:paid
          })
        }
      );

      return json(res,200,{
        extraDue:rows[0]
      });
    }

    if(req.method==='PUT'){
      const b=req.body||{};
      const id=String(b.id||'').trim();

      if(!id){
        return json(res,400,{
          error:'Due ID is required'
        });
      }

      const currentRows=await sb(
        `member_extra_budgets?id=eq.${encodeURIComponent(id)}&select=*`
      );

      const current=currentRows[0];

      if(!current){
        return json(res,404,{
          error:'Extra due not found'
        });
      }

      const total=
        b.totalAmount===undefined
          ?Number(current.total_amount)
          :Number(b.totalAmount);

      const paid=
        b.paidAmount===undefined
          ?Number(current.paid_amount)
          :Number(b.paidAmount);

      if(
        !Number.isFinite(total)||
        total<0||
        !Number.isFinite(paid)||
        paid<0||
        paid>total
      ){
        return json(res,400,{
          error:'Paid amount must be between ₹0 and the total amount'
        });
      }

      const patch={
        total_amount:total,
        paid_amount:paid
      };

      if(b.memberId!==undefined){
        patch.member_id=String(b.memberId);
      }

      if(b.reason!==undefined){
        patch.reason=String(b.reason).trim();
      }

      const rows=await sb(
        `member_extra_budgets?id=eq.${encodeURIComponent(id)}`,
        {
          method:'PATCH',
          body:JSON.stringify(patch)
        }
      );

      return json(res,200,{
        extraDue:rows[0]
      });
    }

    if(req.method==='DELETE'){
      const id=String(
        (req.query&&req.query.id)||''
      ).trim();

      if(!id){
        return json(res,400,{
          error:'Due ID is required'
        });
      }

      await sb(
        `member_extra_budgets?id=eq.${encodeURIComponent(id)}`,
        {
          method:'DELETE'
        }
      );

      return json(res,200,{ok:true});
    }

    return json(res,405,{
      error:'Method not allowed'
    });

  }catch(e){
    return json(res,500,{
      error:e.message||'Request failed'
    });
  }
};
