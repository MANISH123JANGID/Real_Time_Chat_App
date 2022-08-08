const authError = require('./authError')
const badRequest= require('./badRequest')
const CustomAPIError= require('./error')
const notFound= require('./notFound')

module.exports ={
    authError,
    badRequest,
    CustomAPIError,
    notFound
}