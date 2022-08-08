const express= require('express');
const env= require('dotenv')
const app = express();
// const httpServer = require('http').Server(app);
// const io = require("socket.io")(httpServer, {
//     cors: {
//       origin: "http://localhost:3000",
//     }
//   });
// io.on('connection',(socket)=>{
//     console.log('New user connected')
//     socket.on('setup',(userData)=>{
//         socket.join(userData._id);
//         console.log('Hii')
//         socket.emit('connected');
//     })
//     // handling the join chat event emiited by front end when clicked on a chat passed along with the chat id 
//     socket.on('join chat',(room)=>{
//         socket.join(room);
//         console.log('Room joined with id'+room)
//     })
// })

env.config()
require('./db/connectDb');
const errorHandler = require('./middlewares/errorHandler')
const tokenDecoder = require('./tokenDecode')
const notFound= require('./errors/notFound')
const chats =require('./data/data')
const userRoutes= require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
app.use(express.json())

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes)
app.use(notFound)
app.use(errorHandler)

const server  =app.listen(process.env.PORT, ()=>{
    console.log(`SERVER IS RUNNING ON PORT ${process.env.PORT}`)
})

const io= require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin: 'http://localhost:3000'
    }
})
io.on('connection',(socket)=>{
    console.log('Hii server ')
    socket.on('setup',(user)=>{
        const token = user.token;
        const userData= tokenDecoder(token)
        console.log(userData.name)
        socket.join(userData.id)
        socket.emit('connected')
    }) 
    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log(room)
        console.log('User joined Room '+room)
    })

    socket.on('typing',(room)=>{
        socket.in(room).emit('typing');
    })
    socket.on('stop typing',(room)=>{
        socket.in(room).emit('stop typing');
    })

    socket.on('new message',(newMessageRecieved)=>{
        let chat= newMessageRecieved.chat
        console.log(newMessageRecieved)
        chat.users.forEach((user)=>{
            if(user._id==newMessageRecieved.sender._id) return;
            console.log(user._id)
            socket.in(user._id).emit('message recieved', newMessageRecieved)
        })
    })
})







