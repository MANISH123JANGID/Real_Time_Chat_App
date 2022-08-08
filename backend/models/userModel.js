const mongoose= require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Provide Name"]
    }, 
    email:{
        type:String,
        require:[true,'Please Provide Email'],
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'Please Provide valid email'
        ],
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        minLength:6,
        required:[true,'Please Provide the password']
    },
    pic:{
        type:String,
        default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    }
},{
    timestamps:true
})

userModel.methods.generateToken=async function(){
    const token =await jwt.sign({id: this._id, name: this.name},process.env.JWT_SECRET,{expiresIn:'5d'})
    return token
}
// which function should be the async and which should not
// in which situation should we use the async handler 
userModel.methods.checkPassword= async function(userPassword){
    const isMatch=await bcrypt.compare(userPassword,this.password)
    return isMatch
}



/*
Hashing is a one-way ticket to data encryption. Hashing performs a one-way transformation
 on a password, turning the password into another String, called the hashed password.
  Hashing is called one way because it's practically impossible to get the original text
   from a hash.

*/
userModel.pre('save',async function(next){
/* 
In password hashing, a salt consists of a collection of random bits that are used whilst hashing a user's password. As the salt is different for each user, it means that even if users A and B have the same password, their resulting password hashes will be different.
*/
    const salt =await bcrypt.genSalt(10)
    this.password=await bcrypt.hash(this.password, salt)
    next()
})


module.exports= mongoose.model('User',userModel);
