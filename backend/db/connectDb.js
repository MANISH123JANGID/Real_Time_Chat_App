const mongoose= require('mongoose')
mongoose.connect(process.env.MONGO_URI,{
}).then(
    console.log("succesfully connected to MongoDB")
).catch(error=>console.log(error))