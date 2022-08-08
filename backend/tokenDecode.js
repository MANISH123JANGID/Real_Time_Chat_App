const jwt= require('jsonwebtoken')

const tokenDecoder= (token) => {
    const payLoad=  jwt.verify(token, process.env.JWT_SECRET)
    return payLoad
}

module.exports= tokenDecoder