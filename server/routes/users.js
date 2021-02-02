var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt    = require('jsonwebtoken');
const multer = require('multer');
const saltRounds = 10;
const accessToken = require('../middleware/accessToken');

const { sequelize, User,Record }  =  require('../models'); 

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

const checkEmail = async(email) =>{
 console.log(email);
 const user = await User.findOne({where:{email}});
  return (user) ?  user:'';
}

router.post('/register',async(req,res) =>{
  const {name,email,password}  = req.body;

  if(!name)  return res.json({status:false,message:'Username is required.'});
  if(!email)  return res.json({status:false,message:'Email is required.'});
  if(!password)  return res.json({status:false,message:'Password is required.'});

  try{
    // console.log(checkEmail(email))
    if(await checkEmail(email) !='') return res.json({status:false,message:'User already exist.'});

   const hash = bcrypt.hashSync(password,saltRounds);
   const user = await User.create({name,email,password:hash});
   if(user) return res.json({status:true,message:'User has been created successfully.'});

  }catch(err){
    console.log(err)
    return res.json({status:false,message:'Something is wrong.'});
  }

});


router.post('/login',async(req,res) => {
   const {email,password} = req.body;
  try{
    const user = await User.findOne({where:{email}});
    if(!user) return res.json({status:false,message:'Email and passoword does not matched.'});
    var token = jwt.sign({ user_id:user.id }, 'shhhhh');
    return res.json({status:true,data:{token:token},message:'Login successfully'})
  }catch(err){
    return res.json({status:false,message:'Something is wrong.'});
  }
});


router.post('/create',accessToken,async(req,res) =>{
    const {pname,bname,gname} = req.body;
    if(!pname) return res.json({status:false,messge:'Person name is required.'});
    if(!bname) return res.json({status:false,messge:'Business name is required.'});
    if(!gname) return res.json({status:false,messge:'GST number is required.'});

    try{
     const record = await Record.create({pname,bname,gname});
     if(record) return res.json({status:true});
    }catch(err){
      console.log(err)
      return res.json({status:false,messge:'Something is wrong.'});
    }
});


router.get('/',accessToken,async(req,res) => {
  try{
    
    const user = await Record.findAll({order: [['updatedAt', 'DESC']]});
    if(user)  return res.json({status:true, data:{details:user}, message:"Data"});

    return res.json({status:false,message:"There is not data"});
    
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});


router.get('/edit/:id',accessToken,async(req,res) =>{
  try{
     const data = await Record.findOne({where:{id:req.params.id}});
     if(data) return res.json({status:true,data:{user:data},message:'User data.'});
  }catch(err){
  console.log(err)
  }
});



router.post('/update',accessToken,async(req,res) =>{
  const {id,pname,bname,gname} = req.body;
  if(!id) return res.json({status:false,messge:'ID is required.'});
  if(!pname) return res.json({status:false,messge:'Person name is required.'});
  if(!bname) return res.json({status:false,messge:'Business name is required.'});
  if(!gname) return res.json({status:false,messge:'GST number is required.'});

  try{
   const user = await Record.update({pname,bname,gname},{where:{id:id}});
   if(user) return res.json({status:true});
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});



router.get('/delete/:id',accessToken,async(req,res) => {
    const { id } = req.params;
    // console.log('okkkkkkkkkkkkkkkkkkk')
  try{
    const data = await Record.destroy({where:{id:id}});
    if(data) return res.json({status:true,message:"Record deleted successfully."});

    return res.json({status:false,message:"Try again."})
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});



router.get('/profile',accessToken,async(req,res) =>{
  try{
    const user = await User.findOne({where:{id:req.user.user_id},attributes:{exclude:['password']}});
    if(user) return res.json({status:true,data:{userdetails:user},message:'User details'});
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })
 
router.post('/profile-update',accessToken,upload.single('image'),async(req,res) =>{
  const {name} = req.body;
  console.log(req.file.filename)
  try{
     const user = await User.findOne({where:{id:req.user.user_id}});
     user.name = name;
     user.image = req.file.filename;
     user.save();
     return res.json({status:true,message:'User details updated successfully.'});

   
  }catch(err){
    console.log(err)
    return res.json({status:false,messge:'Something is wrong.'});
  }
});




module.exports = router;
