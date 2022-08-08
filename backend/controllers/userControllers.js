const User= require('../models/userModel')
const{ authError,
    badRequest,
    CustomAPIError,
    notFound}= require('../errors/main')
const asyncHandler = require('express-async-handler');
// const userModel = require('../models/userModel');

const registerUser= asyncHandler( async (req,res) => {
    const { name, email, password, pic} = req.body
    // after destructuring the various variables from the req object we will check whether any value is empty or not and
    // if any value is empty then we will throw a bad request error 
    if(!name || !email || !password ){
        throw new badRequest('Please provide all the credentials');
    }
    // after checking the credentials we will check whether the user is already present or not in the database and
    const userPresent =await User.findOne({email});
    if(userPresent){
        throw new badRequest(`User already registered with the email: ${email}`);
    }
    // now we will create a new user object 

    const newUser = new User({name, email, password, pic});
    console.log(password)
    const saveNewUser=await newUser.save()
    console.log(saveNewUser)
    if(!saveNewUser){
         throw new Error('Something went wrong please try again!')
    }
    const token =await saveNewUser.generateToken()
    res.status(201).json({message:"New user created succesfully", token: token})
})

const authUser=asyncHandler( async (req, res) => {
    const {email, password}= req.body
    if(!email || !password){
        throw new badRequest('Please provide the credentials');
    }
    const isUserRegistered =await User.findOne({email});
    if(!isUserRegistered){
        return res.status(404).json({message:`User not found with email: ${email}`}) 
    }
    const isPasswordCorrect =await isUserRegistered.checkPassword(password)
    if(!isPasswordCorrect){
        throw new authError('Password is incorrect')
    }
    const token=await isUserRegistered.generateToken() 
    res.status(200).json({message:'User login successful', token: token})
})

const getAllusers= asyncHandler( async(req, res)=>{
    const search = req.query.search 
    ?
    {
        $or:
        [
            {name:{$regex:req.query.search,$options:'i'} },
            {email:{$regex:req.query.search,$options:"i"}}
        ],
    }:{};
    console.log(search)
    const users =await User.find(search).find({_id:{$ne:req.user.id}});
    console.log(users)
    res.status(200).json(users)
})

module.exports= {registerUser, authUser, getAllusers}