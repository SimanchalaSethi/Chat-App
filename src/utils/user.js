const users =[]

// add user, get user, remove user , getUserInRoom

const addUser=({id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error: 'Username and room are required!'
        }
    }
    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //vallidate username
    if(existingUser){
        return {
            error: 'Username is alreday taken.  Please use different username....'
        }
    }
    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)
    if(index !==-1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}
const getUserInRoom = (room)=>{
    return users.filter((user)=> user.room === room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}











// addUser({
//     id: 1,
//     username:'jintu  ',
//     room: 'bbsr'
// })
// console.log(users)

// const res = addUser({
//     id: 22,
//     username:'jitu',
//     room: 'bm pur'
// })
// console.log(res)

// const rem = removeUser(22)
// console.log(rem)
// console.log(users)

// console.log(getUser(1))
// console.log(getUserInRoom('bbs'))