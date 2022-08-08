const express= require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const {accessChat, fetchChats, createGroupChat, renameGroup, addtoGroup,removefromGroup}= require('../controllers/chatControllers')
router.route('/').post(authMiddleware,accessChat)
router.route('/').get(authMiddleware,fetchChats)
router.route('/group').post(authMiddleware,createGroupChat)
router.route('/rename').patch(authMiddleware,renameGroup)
router.route('/groupremove').patch(authMiddleware,removefromGroup)
router.route('/groupadd').patch(authMiddleware,addtoGroup)

module.exports= router