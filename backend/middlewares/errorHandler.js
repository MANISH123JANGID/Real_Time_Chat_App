const CustomAPIError= require('../errors/error');

const errorHandler= async(err,req,res,next) => {
    if(err instanceof CustomAPIError) {
       return res.status(err.statusCode).json({message:err.message});
    }
    res.status(500).json({message:err.message});
}

module.exports=errorHandler