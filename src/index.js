const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generatesMessages, generateLocationMessage}=require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom}= require('./utils/user')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))

// let count = 0

io.on('connection', (socket) => {
    console.log('Client connected...')
    // socket.emit('countUpdate', count)
    // socket.on('increment', () => {
    //    count++
    //     // socket.emit('countUpdate', count) // this line of code is for a specific connection
    //     io.emit('countUpdate', count)// this line of code for every connection 
    // })
   
    socket.on('join',(options, callback)=>{
        const {user, error}=addUser({id: socket.id, ...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generatesMessages('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generatesMessages('Admin',`${user.username} has joined!...`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()

    })
    socket.on('sendMessage',(data, callback)=>{
        const user = getUser(socket.id)
       console.log(user)
        const filter = new Filter();
        if(filter.isProfane(data)){
            return callback('Profanity is not allowed.....') 
        }
        console.log(user.username)
       io.to(user.room).emit('message', generatesMessages(user.username,data))    
       callback()
    })
    socket.on('sendLocation', (data, callback)=>{  
       const user = getUser(socket.id)
      
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${data.Latitude},${data.Longitude}`))
         callback()

    })  
    socket.on('disconnect',()=>{ 
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generatesMessages('Admin',`${user.username} has left...`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            }) 
        }
       
    })
})


server.listen(port, () => {
    console.log(`This app is on.. ${port}`)
})