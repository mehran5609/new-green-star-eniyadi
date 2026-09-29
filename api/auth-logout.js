const {json,cookie}=require('./_lib');
module.exports=async function(req,res){if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});res.setHeader('Set-Cookie',cookie('ngs_session','',0));return json(res,200,{ok:true})}
