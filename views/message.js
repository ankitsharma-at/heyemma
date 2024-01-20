const username = document.querySelector('#username-name').innerHTML;
const name = document.querySelector('#username-name').innerHTML
      
socket.emit('set username', name);

if (Notification.permission === "granted") {
  
  navigator.serviceWorker.register('/views/sw.js')
  .then(registration => {
        registration.showNotification(`Hello ${name}!`, {
          body: `You're now connected with Emma`,
          icon: `https://media.discordapp.net/attachments/1008571051392909393/1105008258764242984/SUNSHINE_Create_a_hyper-realistic_4k_image_of_Emma_a_young_woma_07a1a23a-4886-48a8-9a8f-e03c338d8cff.png`,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
  })
} else if (Notification.permission === "default") {
  
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
  navigator.serviceWorker.register('/views/sw.js')
  .then(registration => {
        registration.showNotification(`Hello ${username}!`, {
          body: `You're now connected with Emma`,
          icon: `https://media.discordapp.net/attachments/1008571051392909393/1105008258764242984/SUNSHINE_Create_a_hyper-realistic_4k_image_of_Emma_a_young_woma_07a1a23a-4886-48a8-9a8f-e03c338d8cff.png`,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
        
       
  })
  .catch(function(error) {
    console.log('Service worker registration failed:', error);
  });
      
    } else {
      console.log("Notification permission denied.");
    }
  });
}
  


form.addEventListener('submit', e => {
  e.preventDefault();
  
  socket.emit('send message', input.value);
  input.value = '';
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
});

socket.on('message', (message, isClientmsg) => {
  if(!isClientmsg) {
 const skeletonMessage = document.querySelector('.skeleton-message');
  if (skeletonMessage) {
    skeletonMessage.parentNode.removeChild(skeletonMessage);
  }
  }
  const li = document.createElement('li');
  const newUserMessage = document.getElementById("new-user-message");
  if (newUserMessage && newUserMessage.style.display !== 'none') {
    newUserMessage.style.display = "none";
    }
  li.textContent = message;
  messages.appendChild(li);
  const chatMessages = document.querySelector('.chat-messages');

  if(isClientmsg) {
    const li = document.createElement('li');
  li.innerHTML = `•••`;
  li.classList.add('skeleton-message'); 
  messages.appendChild(li);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('new user', message => {
  const li = document.createElement('p');
  li.innerHTML = message;
  li.id = "new-user-message";
  messages.appendChild(li);
});