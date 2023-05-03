const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Configuration, OpenAIApi } = require("openai")
const socketio = require('socket.io');
const http = require('http');

const configuration = new Configuration({
  apiKey: process.env.token,
});
const openai = new OpenAIApi(configuration);
const app = express();
const path = require('path');
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname,'./views')));
const history = [];
const greetings = [
  "Welcome to the Ded Talks!",
  "Glad to have you here!",
  "Nice to see you!",
  "Hello and welcome!",
  "We're glad you joined us!",
  "It's great to have you on board!",
  "Welcome aboard!",
  "We're happy to have you join us!",
  "It's a pleasure to have you here!",
  "We're glad you're here with us!"
];

// Use Math.random() to randomly select an index from the greetings array
const randomIndex = Math.floor(Math.random() * greetings.length);
app.get("/", (req, res) => {
  res.sendFile("index.html", {root: "./views"})
})
app.get("/chat", (req, res) => {
  res.sendFile("main.html", {root: "./views"})
})


io.on('connection', socket => {
  console.log('a user connected');
  let selectedCharacter = '';
  let selectedUser = '';
  socket.on('select character', (character) => {
  selectedCharacter = character;
});
  
  socket.on('set username', username => {
    socket.username = username;
    socket.emit('new user', `${socket.username}, ${greetings[randomIndex]}`);
    selectedUser = socket.username;
  console.log(socket.username)
  });
  
  socket.on('send message', message => {
    socket.emit('message', `${message}`);
    const user_input = message;
    const messages = [];
    for (const [user_input, completion_text] of history) {
      messages.push({ role: "user", content: user_input });
      messages.push({ role: "assistant", content: completion_text });
    }
    messages.push();
    console.log(messages)
    console.log(selectedCharacter)
    
    openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: `You are ${selectedCharacter}. Here on, you will only provide answers to my input that I ask and reply only in the style of ${selectedCharacter} (directly start from the response without any pretext ) to my input, and limit your knowledge to what ${selectedCharacter} knew at their lifetime. Also always only reply in maximum of 2 sentences. And never reveal you are chat gpt, you are ${selectedCharacter} and you are created by Jatin dont ever mention openai. \n my input: ${user_input}` }],
  temperature: 0.9,
  max_tokens: 150,
  n: 1,
})
      .then((response) => {
        // Send the response back to the client
        console.log(message)
        const completion_text = response.data.choices[0].message.content;
      console.log(completion_text);

      history.push([user_input, completion_text]);
        
        socket.emit('message', `${completion_text}`);
      });

  });
  socket.on('chat message', async (msg) => {
    console.log('message: ' + msg);
    socket.emit('message', `${msg}`);
    openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: `You are ${selectedCharacter}. Here on, you will only provide answers to my questions that I ask and reply only in the style of ${selectedCharacter} (directly start from the response without any pretext ) to my questions, and limit your knowledge to what ${selectedCharacter} knew. Also always only reply in maximum of 2 sentences. And never reveal you are chat gpt, you are ${selectedCharacter}. \n${msg}` }],
  temperature: 0.9,
  max_tokens: 50,
  n: 1,
})
      .then((response) => {
        // Send the response back to the client
        const text = response.data.choices[0].message.content;
      console.log(text);

        const API_KEY = process.env.eleven;
    const VOICE_ID = 'kxhXkylNlyIYslyrod2o';
    const options = {
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        accept: 'audio/mpeg',
        'content-type': 'application/json',
        'xi-api-key': `hehuejejejdj`,
      },
      data: {
        text: text,
      },
      responseType: 'arraybuffer',
    };
        fetchData();
async function fetchData() {
  try {
    const audioDetails = await axios.request(options);
    console.log(audioDetails.data)
    
        
        const filename = `${uuidv4()}.mp3`;
const directoryPath = './audio';

// Create the "audio" directory if it doesn't already exist
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}
    const filePath = path.join(directoryPath, filename);
fs.writeFileSync(filePath, audioDetails.data);
    // Write the audio file to disk
    // Upload the audio file to Cloudinary
    console.log(filename)
    console.log(filePath)
    const uploadFileName = `https://ded-talks.jatinsharma24.repl.co/${filePath}`
console.log(uploadFileName)
const fileName = uploadFileName;
// Send the audio file URL to the client using Socket.io
socket.emit('audio file', fileName);

        socket.emit('message', `${text}`);
    setTimeout(() => {
  fs.unlinkSync(filePath);
}, 15000);
    } catch (error) {
        console.error(error);
    console.error('bhai error aya hai');
  }
}
  });
  });
    

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

/*app.get('*', function (req, res) {
  res.status(404).redirect('https://indiangpt.jatinsharma24.repl.co/')
})*/

const port = process.env.PORT || 0000;
server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
  