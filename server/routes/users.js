var express = require('express');
var router = express.Router();

const { sequelize, User }  =  require('../models'); 

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/create',async(req,res) =>{
    const {pname,bname,gname} = req.body;
    if(!pname) return res.json({status:false,messge:'Person name is required.'});
    if(!bname) return res.json({status:false,messge:'Business name is required.'});
    if(!gname) return res.json({status:false,messge:'GST number is required.'});

    try{
     const user = await User.create({pname,bname,gname});
     if(user) return res.json({status:true});
    }catch(err){
      console.log(err)
      return res.json({status:false,messge:'Something is wrong.'});
    }
});


router.get('/',async(req,res) => {
  try{
    const user = await User.findAll({order: [['updatedAt', 'DESC']]});
    if(user)  return res.json({status:true, data:{details:user}, message:"Data"});

    return res.json({status:false,message:"There is not data"});
    
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});


router.get('/edit/:id',async(req,res) =>{
  try{
     const data = await User.findOne({where:{id:req.params.id}});
     if(data) return res.json({status:true,data:{user:data},message:'User data.'});
  }catch(err){
  console.log(err)
  }
});



router.post('/update',async(req,res) =>{
  const {id,pname,bname,gname} = req.body;
  if(!id) return res.json({status:false,messge:'ID is required.'});
  if(!pname) return res.json({status:false,messge:'Person name is required.'});
  if(!bname) return res.json({status:false,messge:'Business name is required.'});
  if(!gname) return res.json({status:false,messge:'GST number is required.'});

  try{
   const user = await User.update({pname,bname,gname},{where:{id:id}});
   if(user) return res.json({status:true});
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});



router.get('/delete/:id',async(req,res) => {
    const { id } = req.params;
    // console.log('okkkkkkkkkkkkkkkkkkk')
  try{
    const data = await User.destroy({where:{id:id}});
    if(data) return res.json({status:true,message:"Record deleted successfully."});

    return res.json({status:false,message:"Try again."})
  }catch(err){
    console.log(err)
    return res.json({status:true,message:"Record deleted successfully."});
  }
});






module.exports = router;
