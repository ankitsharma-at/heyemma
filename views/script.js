const socket = io();

const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const loginForm = document.getElementById("login-form");

const voice = document.getElementById('mic');
const micBtn = voice;
let finalTranscript = '';
let isRecordingStopped = false;
let isRecording = false;
let sendMessagetoo = false;
let isSpeeking = false;
let voiceBtnhasSlash = false;
const voiceBtn = document.querySelector('#voice');
let isAwake = false;
let RecognitionEnd = false;
let isDetected = false;
let recognition = new window.webkitSpeechRecognition(); 
recognition.continuous = true; 
recognition.interimResults = false;
let isContinuousListeningEnabled = false;
if(isSpeeking) {
    stopRecording();
}
recognition.onend = function() {
  RecognitionEnd = true;
  if(isContinuousListeningEnabled) {
    voiceBtnhasSlash = true;
  voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>'
   isRecording = false;
   isRecordingStopped = true;
  }
};
const SLEEP_WORDS = ["sleep", "stop"]
recognition.onresult = function(event) {
  let current = event.resultIndex;
  let transcript = event.results[current][0].transcript;
  finalTranscript = transcript;
  if(!isAwake) {
    if (isRecordingStopped && finalTranscript !== '') {
    sendMessagetoo = true;
    socket.emit('chat message', finalTranscript, sendMessagetoo);
    
    isRecordingStopped = false; 
    }
  }

  if(isAwake) {
    if(SLEEP_WORDS.some(sleepWord => finalTranscript.includes(sleepWord))) {
      isAwake = false;
    
      micBtn.classList.remove('active');
  micBtn.style.animation = "none";
      return;
    } else {
      //recognition.stop();
      micBtn.classList.remove('active');
  micBtn.style.animation = "none";
      socket.emit('chat message', finalTranscript, sendMessagetoo);
    }
    }
};

if(!isRecordingStopped) {
micBtn.addEventListener('mousedown', touchedStart);
micBtn.addEventListener('touchstart', touchedStart);
}
micBtn.addEventListener('mouseup', stopRecording);
micBtn.addEventListener('touchend', stopRecording);

function touchedStart() {
  if(!isRecording) {
  isRecording = true;
 
  startRecording();
  } else {
    
 micBtn.classList.remove('active');
  micBtn.style.animation = "none";
    recognition.stop();
  }
}

function startRecording() {
  micBtn.classList.add('active');
  micBtn.style.animation = "pulse 2s infinite";
  isRecording = true;
  recognition.start();
}

function stopRecording() {
  recognition.stop();
  isRecordingStopped = true;
  isRecording = false;
 micBtn.classList.remove('active');
  micBtn.style.animation = "none";
}
if(isContinuousListeningEnabled && !isRecording) {
recognition.onerror = function(event) {
  recognition.stop();
  micBtn.classList.remove('active');
  micBtn.style.animation = "none";
  startRecording();
}
}
socket.on('voice msg', text => {
  isSpeeking = true;
var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();

msg.voice = voices[23]; // select the first available voice
msg.text = text;
speechSynthesis.speak(msg);
  const chatMessages = document.querySelector('.chat-messages');
const allLiElements = chatMessages.getElementsByTagName("li");

msg.onstart = function(event) {
  const spokenText = text;
  for (let i = 0; i < allLiElements.length; i++) {
    if (allLiElements[i].textContent.includes(spokenText)) {
      allLiElements[i].classList.add('spoken-text');
allLiElements[i].style.borderColor = "lightgreen";
    }
  }
};

  msg.onend = function(event) {
    isSpeeking = false;
    const spokenText = event.target.text;
  for (let i = 0; i < allLiElements.length; i++) {
    if (allLiElements[i].textContent.includes(spokenText)) {
      allLiElements[i].classList.remove('spoken-text');
      allLiElements[i].style.borderColor = "white";
    }
  }
  
    if (isAwake) {
      RecognitionEnd = false;
      voiceBtnhasSlash = false;
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>'
    startRecording();
    }
}

})

const keyboardBtn = document.querySelector('#keyboard');
const backBtn = document.querySelector('a');
const voiceCutBtn = document.querySelector('#voiceCut');

voiceBtn.addEventListener("click", event => {
  if(RecognitionEnd && !isRecording) {
    startRecording();
  }
  if(!voiceBtnhasSlash) {
  isAwake = false;
    voiceBtnhasSlash = true;
  voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>'
  } else {
    isAwake = true;
    voiceBtnhasSlash = false;
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>'
  }
})

function handleClick() {
  isContinuousListeningEnabled = false;
  isAwake = false;
  stopRecording();
  const chatContainer = document.querySelector('.chat-container');

  chatContainer.style.display = "flex";
  document.querySelector('.voice-container').style.display = "none";
   
}

keyboardBtn.addEventListener('click', handleClick);
backBtn.addEventListener('click', handleClick);
voiceCutBtn.addEventListener('click', handleClick);

const phoneButton = document.getElementById('voiceCall')
phoneButton.addEventListener("click", event => {
  event.preventDefault();

const voiceContainer = document.querySelector('.voice-container');

  voiceContainer.style.display = "flex";

  isContinuousListeningEnabled = true;
  isAwake = true;
  if (isContinuousListeningEnabled) {

    startRecording();
  }
   
  document.querySelector('.chat-container').style.display = "none";
   
});

const videoButton = document.getElementById('videoCall')
videoButton.addEventListener("click", event => {
  event.preventDefault();

const videoContainer = document.querySelector('.video-container');

  videoContainer.style.display = "flex";

   
  document.querySelector('.chat-container').style.display = "none";
   
});
               