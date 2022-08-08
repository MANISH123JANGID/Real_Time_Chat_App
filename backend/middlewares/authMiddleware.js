const{ authError,
    badRequest,
    CustomAPIError,
    notFound}= require('../errors/main')
const jwt= require('jsonwebtoken');
const asyncHandler= require('express-async-handler')
const authMiddleware=asyncHandler( async (req, res, next) =>{
    const header= req.headers.authorization
    if(!header || !header.startsWith('Bearer ')){
        throw new badRequest("Not authorized to access this route")
    }
    try{
        const token = header.split(' ')[1]
        const user= jwt.verify(token, process.env.JWT_SECRET)
        req.user= user
        console.log(user)
        next()
    }catch(err){
        throw new authError('NOT AUTHORIZED') 
    }
})

module.exports= authMiddleware