const socket = io();

const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const loginForm = document.getElementById("login-form");
const submitButton = document.getElementById("submit-button");
const voice = document.getElementById('voice');
const micBtn = voice;
let finalTranscript = '';
let isRecordingStopped = false;
let recognition = new window.webkitSpeechRecognition(); 
recognition.continuous = true; 
recognition.interimResults = false;
recognition.onresult = function(event) {
  let current = event.resultIndex;
  let transcript = event.results[current][0].transcript;
  finalTranscript = transcript;
  
  if (isRecordingStopped && finalTranscript !== '') {
    
    socket.emit('chat message', finalTranscript);
    isRecordingStopped = false; 
  }
};

micBtn.addEventListener('mousedown', function() {
  if (document.getElementById('character').value === "Steve Jobs") {
    startRecording();
  } else {

    document.querySelector('.card').style.display = 'flex';
  }
});

micBtn.addEventListener('touchstart', function() {
  if (document.getElementById('character').value === "Steve Jobs") {
    startRecording();
  } else {

    document.querySelector('.card').style.display = 'flex';
  }
});

micBtn.addEventListener('mouseup', function() {
  if (document.getElementById('character').value === "Steve Jobs") {
    stopRecording();
  }
});

micBtn.addEventListener('touchend', function() {
  if (document.getElementById('character').value === "Steve Jobs") {
    stopRecording();
  }
});



function startRecording() {
  finalTranscript = '';
  recognition.start();
  
}

function stopRecording() {
  recognition.stop();
  

  isRecordingStopped = true;

  if (finalTranscript !== '') {
    
    socket.emit('chat message', finalTranscript);
  }
}
socket.on('audio file', fileName => {
  console.log(fileName)
  playAudio(fileName);
});

function playAudio(audioURL) {
  const audio = new Audio(audioURL);
  audio.play();
}

input.addEventListener('focus', () => {
  voice.style.display = 'none';
});
input.addEventListener('blur', () => {
  voice.style.display = 'flex';
});
const chatMessages = document.querySelector('.chat-messages');
const scrollToBottomButton = document.getElementById('scroll-to-bottom');
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function toggleScrollToBottomButton() {
  if (chatMessages.scrollHeight - chatMessages.scrollTop === chatMessages.clientHeight) {
    scrollToBottomButton.classList.remove('show');
  } else {
    scrollToBottomButton.classList.add('show');
  }
}


scrollToBottomButton.addEventListener('click', scrollToBottom);

chatMessages.addEventListener('scroll', toggleScrollToBottomButton);

toggleScrollToBottomButton();

const cardContainer = document.querySelector('.card');
const cardClose = document.querySelector('#card-close');
cardClose.addEventListener("click", event => {
  event.preventDefault();
  cardContainer.style.display = "none";

})

submitButton.addEventListener("click", event => {

  event.preventDefault();

 if (!document.getElementById("username").value) {
   alert('Bruhh Please Enter All The required fields')
 } else if(document.getElementById('character').value === "none") {
   alert('Bruhh Please Enter All The required fields')
 } else {
const chatContainer = document.querySelector('.chat-container');
  const characterDropdown = document.getElementById('character');
const selectedCharacter = characterDropdown.value;

socket.emit('select character', selectedCharacter);

  chatContainer.style.display = "flex";
     const username = document.getElementById("username").value;
socket.emit('set username', username);

if (Notification.permission === "granted") {
  
  navigator.serviceWorker.register('/views/sw.js')
  .then(registration => {
        registration.showNotification(`Hello ${username}!`, {
          body: `You're now connected with ${selectedCharacter}`,
          icon: `https://media.discordapp.net/attachments/890149366499786762/1102641686825418793/Picsart_23-05-01_22-31-43-138.png`,
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
          body: `You're now connected with ${selectedCharacter}`,
          icon: `https://media.discordapp.net/attachments/890149366499786762/1102641686825418793/Picsart_23-05-01_22-31-43-138.png`,
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


  document.querySelector('.secret').style.display = "none";
   document.querySelectorAll('.secret *').forEach(element => {
    element.style.display = 'none';
  });
  
 }
    });

form.addEventListener('submit', e => {
  e.preventDefault();
  socket.emit('send message', input.value);
  input.value = '';
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('message', message => {

  const li = document.createElement('li');
  const newUserMessage = document.getElementById("new-user-message");
  if (newUserMessage && newUserMessage.style.display !== 'none') {
    newUserMessage.style.display = "none";
    }
  li.textContent = message;
  messages.appendChild(li);
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('new user', message => {
  const li = document.createElement('p');
  li.innerHTML = message;
  li.id = "new-user-message";
  messages.appendChild(li);
});