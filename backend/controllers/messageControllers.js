const asyncHandler = require('express-async-handler')
const Message= require('../models/messageModel')
const User= require('../models/userModel')
const Chat= require('../models/chatModel')
const{ authError,
    badRequest,
    CustomAPIError,
    notFound}= require('../errors/main')
const sendMessage= asyncHandler( async (req, res)=>{
    const { content, chatId}= req.body
    if(!content || !chatId){
        throw new badRequest('Invalid data passed into request')
    }
    const newMessage={
        sender: req.user.id,
        content: content,
        chat: chatId
    }
    let message = await Message.create(newMessage)
    // execPopulate is used to execute the populate method in this type of syntax without this syntax it does not work
    message= await message.populate("sender","name pic")
    message= await message.populate("chat","chatName isGroupChat users latestMessage groupAdmin")
    message= await User.populate(message,{
        path:'chat.users',
        select:'name pic email',
    })


    

    // updating the latestmessage of a particular chat 
    await Chat.findByIdAndUpdate(chatId,{
        latestMessage:message
    })
    res.status(201).json(message)
})

const getAllMessages= asyncHandler( async (req, res)=>{
    const {chatId}= req.params
    console.log(chatId)
    const messages = await Message.find({chat:chatId}).populate('sender','name pic email').populate('chat')
    res.status(200).json(messages)
})

module.exports= {sendMessage,getAllMessages}