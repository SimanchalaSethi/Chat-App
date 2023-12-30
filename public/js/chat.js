const socket=io()
// socket.on('countUpdate',(count)=>{
//     console.log('Count updates.......', count)
// })
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked..')
//     socket.emit('increment')
// })

//Elements 
const $messageForm = document.querySelector('#message-form')
const $messageFromInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix: true})
const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild
    
    //height of the new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight
    //how far have i scrolled ?
    const scrollOffSet = $messages.scrollTop + visibleHeight
    
    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (data)=>{
  
    const html = Mustache.render(messageTemplate,{
        username:data.username,
        message:data.text ,
        createdAt:moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(data)=>{
    console.log(data)
    const html = Mustache.render(locationMessageTemplate,{
        username: data.username, 
        url: data.url,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room, users})=>{
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
   //disable
   $messageFormButton.setAttribute('disabled', 'disabled')

    // const message = document.querySelector('input').value  //1.1
    const message =e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFromInput.value=''
        $messageFromInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered!..', message)
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Sorry your browser has not supperted geolocation')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
  // console.log(position.coords.latitude)  
    const data ={
        Longitude: position.coords.longitude,
        Latitude: position.coords.latitude
    }
    socket.emit('sendLocation',data,()=>{
        console.log(data)
            $sendLocationButton.removeAttribute('disabled')
        return console.log('Locations Shared')
    })
    })
})
socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})