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
let recognition = new window.webkitSpeechRecognition(); // create a new instance of SpeechRecognition
recognition.continuous = true; 
recognition.interimResults = false;// keep recognition going until stop is called

recognition.onresult = function(event) {
  let current = event.resultIndex;
  let transcript = event.results[current][0].transcript;
  finalTranscript = transcript;
  
  
  // if stopRecording was called before onresult fired, make the API request with the current finalTranscript
  if (isRecordingStopped && finalTranscript !== '') {
    
    socket.emit('chat message', finalTranscript);
    isRecordingStopped = false; // reset the flag
  }
};

micBtn.addEventListener('mousedown', function() {
  if (document.getElementById('character').value === "Steve Jobs") {
    startRecording();
  } else {
    // Show the pricing card
    document.querySelector('.card').style.display = 'flex';
  }
});

micBtn.addEventListener('touchstart', function() {
  if (document.getElementById('character').value === "Steve Jobs") {
    startRecording();
  } else {
    // Show the pricing card
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
// Get the selected character from the dropdown

// Send the selected character to the server
const chatMessages = document.querySelector('.chat-messages');
const scrollToBottomButton = document.getElementById('scroll-to-bottom');

// Scroll to the bottom of the chat-messages div
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show/hide the scroll to bottom button based on the user's position
function toggleScrollToBottomButton() {
  if (chatMessages.scrollHeight - chatMessages.scrollTop === chatMessages.clientHeight) {
    // User is at the bottom of the chat-messages div
    scrollToBottomButton.classList.remove('show');
  } else {
    scrollToBottomButton.classList.add('show');
  }
}

// Scroll to the bottom when the scroll to bottom button is clicked
scrollToBottomButton.addEventListener('click', scrollToBottom);

// Show/hide the scroll to bottom button based on the user's position
chatMessages.addEventListener('scroll', toggleScrollToBottomButton);

// Call the toggleScrollToBottomButton function to show/hide the button on page load
toggleScrollToBottomButton();

      
// Add an event listener to the submit button
const cardContainer = document.querySelector('.card');
const cardClose = document.querySelector('#card-close');
cardClose.addEventListener("click", event => {
  event.preventDefault();
  cardContainer.style.display = "none";
//  chatMessages.style.display = "flex-inline";
})

submitButton.addEventListener("click", event => {
  // Prevent the default form submission behavior
  event.preventDefault();
// Get the username entered by the user
 if (!document.getElementById("username").value) {
   alert('Bruhh Please Enter All The required fields')
 } else if(document.getElementById('character').value === "none") {
   alert('Bruhh Please Enter All The required fields')
 } else {
const chatContainer = document.querySelector('.chat-container');
  const characterDropdown = document.getElementById('character');
const selectedCharacter = characterDropdown.value;

socket.emit('select character', selectedCharacter);
   //document.getElementById('characterName').innerHTML = selectedCharacter;
  chatContainer.style.display = "flex";
     const username = document.getElementById("username").value;
socket.emit('set username', username);

if (Notification.permission === "granted") {
  console.log("Notification permission granted.");
  navigator.serviceWorker.register("/sw.js").then(registration => {
    console.log("Service worker registered:", registration);
    registration.showNotification(`Hello ${username}!`, {
          body: `You're now connected with ${selectedCharacter}`,
          icon: `https://media.discordapp.net/attachments/890149366499786762/1102641686825418793/Picsart_23-05-01_22-31-43-138.png`,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
    console.log("Notification shown.");
  });
} else if (Notification.permission === "default") {
  console.log("Notification permission not yet granted. Requesting permission...");
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/views/sw.js')
  .then(registration => {
        console.log("Service worker registered:", registration);
        registration.showNotification(`Hello ${username}!`, {
          body: `You're now connected with ${selectedCharacter}`,
          icon: `https://media.discordapp.net/attachments/890149366499786762/1102641686825418793/Picsart_23-05-01_22-31-43-138.png`,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'vibration-sample'
        });
        console.log("Notification shown.");
       
    console.log('Service worker registered successfully');
  })
  .catch(function(error) {
    console.log('Service worker registration failed:', error);
  });
}
      
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
  // Create a new list item
  const li = document.createElement('p');
  // Set the list item's inner HTML to the message
  li.innerHTML = message;
  li.id = "new-user-message";
  // Append the list item to the messages list
  messages.appendChild(li);
});