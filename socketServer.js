let users = [];

const EditData = (data, id, call) => {
  const newData = data.map(item =>
    item.id === id ? { ...item, call } : item
  )
  return newData;
}


const SocketServer = (socket) => {
  // Connection------------------
  socket.on('joinUser', id => {
    users.push({ id, socketId: socket.id })
  })
  // Disconnect-------------------
  socket.on('disconnect', () => {
    users = users.filter(user => user.socketId !== socket.id)
  })

  // Like---------------------
  socket.on('likeStatus', newLike => {
    const ids = [...newLike.user.followers, newLike.user._id]
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach(client => {
        socket.to(`${client.socketId}`).emit('likeToClient', newLike)
      })

    }
  })

  // Dislike---------------------
  socket.on('disLikeStatus', newLike => {
    const ids = [
      ...newLike.user.followers, newLike.user._id
    ]
    const clients = users.filter((user) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach(client => {
        socket.to(`${client.socketId}`).emit('disLikeToClient', newLike)
      })

    }
  })

  // Comment---------------------
  socket.on('commentRealTime', newPost => {
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))

    if (clients.length > 0) {
      clients.forEach(client => {
        socket.to(`${client.socketId}`).emit('commentRealTimeToClient', newPost)
      })

    }
  })

  socket.on('deleteComment', newPost => {
    const ids = [...newPost.user.followers, newPost.user._id]
    const clients = users.filter(user => ids.includes(user.id))

    if (clients.length > 0) {
      clients.forEach(client => {
        socket.to(`${client.socketId}`).emit('deleteCommentToClient', newPost)
      })
    }
  })

  // Follow
  socket.on('follow', flUser => {
    const user = users.find(user => user.id === flUser._id)
    user && socket.to(`${user.socketId}`).emit('followToClient', flUser)
  })

  socket.on('unFollow', flUser => {
    const user = users.find(user => user.id === flUser._id)
    user && socket.to(`${user.socketId}`).emit('unFollowToClient', flUser)
  })

  // Notification
  socket.on('createNotify', msg => {
    const client = users.find(user => msg.recipients.includes(user.id))
    client && socket.to(`${client.socketId}`).emit('createNotifyToClient', msg)
  })

  socket.on('removeNotify', msg => {
    const client = users.find(user => msg.recipients.includes(user.id))
    client && socket.to(`${client.socketId}`).emit('removeNotifyToClient', msg)

  })
  // Message
  socket.on('addMessage', msg => {
    const user = users.find(user => user.id === msg.recipient)
    user && socket.to(`${user.socketId}`).emit('addMessageToClient', msg)
  })


  // Check User Online
  socket.on('checkUserOnline', data => {
    const following = users.filter(user =>
      data.following.find(item => item._id === user.id)
    )

    const clients = users.filter(user =>
      data.followers.find(item => item._id === user.id)
    )

    if (clients.length > 0) {
      clients.forEach(client => {
        socket.to(`${client.socketId}`).emit('checkUserOnlineToClient', data._id)
      })
    }

  })


  // Call User
  socket.on('callUser', data => {
    users = EditData(users, data.sender, data.recipient)

    const client = users.find(user => user.id === data.recipient)

    if (client) {
      if (client.call) {
        socket.emit('userBusy', data)
        users = EditData(users, data.sender, null)
      } else {
        users = EditData(users, data.recipient, data.sender)
        socket.to(`${client.socketId}`).emit('callUserToClient', data)
      }
    }
  })

  socket.on('endCall', data => {
    const client = users.find(user => user.id === data.sender)

    if (client) {
      socket.to(`${client.socketId}`).emit('endCallToClient', data)
      users = EditData(users, client.id, null)

      if (client.call) {
        const clientCall = users.find(user => user.id === client.call)
        clientCall && socket.to(`${clientCall.socketId}`).emit('endCallToClient', data)

        users = EditData(users, client.call, null)
      }
    }
  })

}
module.exports = SocketServer;