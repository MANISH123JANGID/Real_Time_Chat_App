const asyncHandler = require('express-async-handler')
const{ authError,
    badRequest,
    CustomAPIError,
    notFound}= require('../errors/main')
const Chat= require('../models/chatModel')
const User= require('../models/userModel')

// this controller is responsible for fetching or creating one on one chats
const accessChat = asyncHandler(async (req, res)=>{
    // the user with which we have to access the chat or create the chat that users id we have to pass to the req object
    const {userId}= req.body
    if(!userId){
        throw new badRequest('UserId not received in params')
    }
    let isChat=await Chat.find({
        isGroupChat: false,
        $and:[
            {users:{$elemMatch:{$eq:userId}}},
            {users:{$elemMatch:{$eq:req.user.id}}}
        ]
        // if we find the chat then we will populate the users array withouth the password and also the latest message 
    }).populate('users','-password').populate('latestMessage')
    
    isChat= await User.populate(isChat,{
        path:'latestMessage.sender',
        select:'name pic email'
    })
    if(isChat.length>0){
        res.send(isChat[0])
    }else{
        let chatData= {
            chatName: 'Sender',
            isGroupChat: false,
            users:[userId, req.user.id] 
        }
        try{
            const chatCreated= await Chat.create(chatData)
            const fullChat=await Chat.findOne({_id:chatCreated._id}).populate('users','-password')
            return res.status(200).send(fullChat)
        }catch(err){
            res.status(400)
            throw new Error(err.message)
        }
    }
})

const fetchChats=asyncHandler(async (req, res)=>{
    // populate is used to place the complete document as it is in place of that object id
    let allChats=await Chat.find({users:{$elemMatch:{$eq:req.user.id}}}).populate('users','-password').populate('latestMessage').populate('groupAdmin').sort({updatedAt:-1})
    allChats = await User.populate(allChats,{
        path:'latestMessage.sender',
        select:'name pic email'
    })
    res.status(200).send(allChats)
})

const createGroupChat= asyncHandler(async(req, res)=>{
    if(!req.body.name || !req.body.users){
        throw new badRequest('Please fill all the fields')
    }
    const users= JSON.parse(req.body.users)
    if(users.length<2){
        throw new badRequest('Number of participants cannot be less than two!')
    }
    users.push(req.user.id)
    const newGroupChat= new Chat({
        chatName: req.body.name,
        isGroupChat:true,
        users: users,
        groupAdmin: req.user.id
    })
    const groupCreated= await newGroupChat.save()
    if(!groupCreated){
        res.status(400).json({message: 'Group not created'})
    }
    const fullGroupChat= await Chat.findOne({_id:newGroupChat._id}).populate('users','-password').populate('groupAdmin','-password').populate('latestMessage')
    console.log(fullGroupChat)
    res.status(200).json(fullGroupChat);
})

const renameGroup= asyncHandler(async(req, res)=>{
    const {chatId, chatName}= req.body
    const updatedChat=await Chat.findByIdAndUpdate({_id: chatId},{chatName:chatName},{
        // new:true will return the document after updating it.
        new:true
    }).populate('users','-password').populate('groupAdmin','-password')
    if(!updatedChat){
        return res.status(404).json({message:'CHAT NOT FOUND!'})
    }
    res.status(200).json(updatedChat)
})

const addtoGroup= asyncHandler( async (req, res)=>{
    const {chatId,userId}= req.body
    // find method will return an array
    const isUserPresent=await Chat.find({_id:chatId,isGroupChat:true,users:{$elemMatch:{$eq:userId}}})
    if(isUserPresent.length==1){
        throw new badRequest('User Already Present in the Chat')
    }
    const added=await Chat.findByIdAndUpdate({_id:chatId},
        {$push:{users:userId}},
        {new:true}).populate('users','-password').populate('groupAdmin','-password')
    if(!added){
        return res.status(404).json({message:'Chat Not Found'})
    }
    res.status(200).json(added)
})

const removefromGroup= asyncHandler( async (req, res)=>{
    // only groupAdmin can remove the other users from the group
    // other people cannot remove the groupadmin 
    const {chatId, userId}= req.body
   const isGroupAdmin= await Chat.findOne({_id:chatId, groupAdmin:req.user.id})
   if(isGroupAdmin){
    const personRemoved= await Chat.findOneAndUpdate({_id:chatId},{
        $pull:{users:userId}
    }).populate('users','-password').populate('groupAdmin','-password')
    console.log(personRemoved)
    if(personRemoved){
        return res.status(200).json({message:'The person was removed succesfully'})
    }else{
        return res.status(404).json({message:'Person not found!'})
    }
   }else{
        return res.status(401).json({message:'Only GroupAdmin can remove users'})
   }
   
})


module.exports= {accessChat, fetchChats, createGroupChat, renameGroup, addtoGroup, removefromGroup}