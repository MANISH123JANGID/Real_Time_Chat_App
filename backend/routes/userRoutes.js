const express= require('express')
const router= express.Router()
const authMiddleware= require('../middlewares/authMiddleware')
const {registerUser, authUser,getAllusers} = require('../controllers/userControllers')
router.route('/').post(registerUser).get(authMiddleware,getAllusers)
router.route('/login').post(authUser,authMiddleware) 

module.exports= router