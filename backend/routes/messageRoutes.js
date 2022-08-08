const express=require('express')
const router= express.Router()
const {sendMessage,getAllMessages}= require('../controllers/messageControllers')
const authMiddleware= require('../middlewares/authMiddleware')
router.route('/').post(authMiddleware,sendMessage)
router.route('/:chatId').get(authMiddleware,getAllMessages)
 
module.exports= router