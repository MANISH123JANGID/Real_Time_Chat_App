const CustomAPIError= require('./error')

class authError extends CustomAPIError{
    constructor(message){
        super(message)
        this.statusCode=401;
    }
}
module.exports= authError