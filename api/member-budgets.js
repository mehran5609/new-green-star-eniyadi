const {db,json,requireAdmin}=require('./_lib');

module.exports=async function handler(req,res){
  if(!requireAdmin(req,res))return;

  try{
    const client=db();

    if(req.method==='GET'){
      const {data,error}=await client
        .from('member_extra_budgets')
        .select('*')
        .order('created_at',{ascending:false});

      if(error)throw error;

      return json(res,200,{
        extraDues:data||[]
      });
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
        !Number.isFinite(total) ||
        total<0 ||
        !Number.isFinite(paid) ||
        paid<0 ||
        paid>total
      ){
        return json(res,400,{
          error:'Paid amount must be between ₹0 and the total amount'
        });
      }

      const {data,error}=await client
        .from('member_extra_budgets')
        .insert({
          member_id:memberId,
          reason,
          total_amount:total,
          paid_amount:paid
        })
        .select('*')
        .single();

      if(error)throw error;

      return json(res,200,{
        extraDue:data
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

      const {
        data:current,
        error:findError
      }=await client
        .from('member_extra_budgets')
        .select('*')
        .eq('id',id)
        .maybeSingle();

      if(findError)throw findError;

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
        !Number.isFinite(total) ||
        total<0 ||
        !Number.isFinite(paid) ||
        paid<0 ||
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
        patch.member_id=String(b.memberId).trim();
      }

      if(b.reason!==undefined){
        patch.reason=String(b.reason).trim();
      }

      const {
        data,
        error
      }=await client
        .from('member_extra_budgets')
        .update(patch)
        .eq('id',id)
        .select('*')
        .single();

      if(error)throw error;

      return json(res,200,{
        extraDue:data
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

      const {error}=await client
        .from('member_extra_budgets')
        .delete()
        .eq('id',id);

      if(error)throw error;

      return json(res,200,{
        ok:true
      });
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
