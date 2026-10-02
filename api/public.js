const {db,json,monthNow}=require('./_lib');
module.exports=async function(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  try{
    const client=db();
    const [{data:members,error:me},{data:payments,error:pe},{data:achievements,error:ae},{data:budgets,error:be},{data:memories,error:xe},{data:settings,error:se}]=await Promise.all([
      client.from('members').select('id,name,role,photo_url').eq('active',true).order('name'),
      client.from('payments').select('member_id,month,amount,paid_at').eq('month',monthNow()),
      client.from('achievements').select('id,year,title,description,photo_url').order('created_at',{ascending:false}),
      client.from('budgets').select('id,program_name,event_date,cost,received,notes,photo_url').order('event_date',{ascending:false}),
      client.from('memories').select('id,title,memory_date,description,photo_url,created_at').order('created_at',{ascending:false}),
      client.from('settings').select('key,value').eq('key','monthly_fee').maybeSingle()
    ]);
    const error=me||pe||ae||be||xe||se;if(error)throw error;
    return json(res,200,{members:members||[],payments:payments||[],achievements:achievements||[],budgets:budgets||[],memories:memories||[],monthlyFee:Number(settings?.value??100),month:monthNow()});
  }catch(e){return json(res,500,{error:e.message||'Failed to load club data'})}
}
