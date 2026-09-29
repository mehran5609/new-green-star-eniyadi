const {json,validSession}=require('./_lib');
module.exports=async function(req,res){if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});return json(res,200,{authenticated:validSession(req)})}
