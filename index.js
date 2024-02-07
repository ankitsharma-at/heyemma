const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Configuration, OpenAIApi } = require("openai");
const socketio = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

const configuration = new Configuration({
  apiKey: process.env.token,
});

const openai = new OpenAIApi(configuration);
const app = express();
const path = require('path');
const server = http.createServer(app);
const io = socketio(server);

// Configure session and passport
app.use(cookieParser());
app.use(session({
  secret: 'secretbhai',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");

    async () => {
      console.log('Fetching all users:');
      const users = await User.find();
      console.log(users);
    }
}).catch((err) => {
  console.log("Error connecting to MongoDB", err);
});

// Define User schema and model
const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  profilePicture: String
});

const User = mongoose.model('User', userSchema);

User.find()
  .then((users) => {
    console.log('All users:');
    console.log(users);
  })
  .catch((err) => {
    console.log('Error fetching users', err);
  });// ...
/*
// Find user by name or email and update isPremium to true
User.findOneAndUpdate(
  {
    $or: [
      { name: 'desiredName' }, // Replace 'desiredName' with the actual name you want to search
      { email: 'desiredEmail' }, // Replace 'desiredEmail' with the actual email you want to search
    ],
  },
  { isPremium: true },
  { new: true }
)
  .then((user) => {
    if (user) {
      console.log('User found and updated:');
      console.log(user);
    } else {
      console.log('User not found.');
    }
  })
  .catch((err) => {
    console.log('Error updating user:', err);
  });

// ...
*/
// Configure Google authentication strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.id,
      clientSecret: process.env.sec,
      callbackURL: process.env.callback,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
          });
          await newUser.save();
          done(null, newUser);
        } else {
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

/*passport.use(new GoogleStrategy({
  clientID: process.env.id,
  clientSecret: process.env.sec,
  callbackURL: process.env.callback
}, async (accessToken, refreshToken, profile, done) => {

 User.findOne({ googleId: profile.id }).then((err, user) => {
   
    if (err) {
      return done(err);
    }
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value
      });
      user.save().then((err) => {
        if (err) {
          console.log(err);
        }
        return done(err, user);
      }).catch((err)=>{
        console.log(err);
    })
    } else {
      return done(err, user);
    }
  });

}));*/

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './views')));

app.get("/", (req, res) => {
  
    res.sendFile("home.html", { root: "./views" });
  
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: './views' });
});
app.get('/privacy', (req, res) => {
  res.sendFile('privacy.html', { root: './views' });
});
app.get('/tos', (req, res) => {
  res.sendFile('tos.html', { root: './views' });
});

app.get("/chat", isAuthenticated, (req, res) => {
  const { profilePicture } = req.user;
  const trimmerName = req.user.name;
  const name = trimmerName.split(' ')[0];
  console.log(req.user);
  console.log(name, profilePicture);
  req.session.name = name;
  req.session.profilePicture = profilePicture;
  res.render('main', { name, profilePicture });
});
app.get("/test", (req, res) => {
  
  const name = 'Jatin';
  const profilePic = 'https://media.discordapp.net/attachments/1008571051392909393/1105008258764242984/SUNSHINE_Create_a_hyper-realistic_4k_image_of_Emma_a_young_woma_07a1a23a-4886-48a8-9a8f-e03c338d8cff.png';
  req.session.name = name;
  req.session.profilePic = profilePic;
  res.render('main', { name, profilePic });
  /*res.sendFile(path.join(__dirname, './views/main.html'));*/
});


// Googlees
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    successRedirect: '/chat',
    session: true,
    failureRedirect: '/login'
  }));

const history = [];
const greetings = [
  "Glad to have you here!",
  "Nice to see you!",
  "Hello and welcome!",
  "We're glad you joined!",
  "It's great to have you on board!",
  "Welcome aboard!",
  "We're happy to have you join us!",
  "It's a pleasure to have you here!",
  "We're glad you're here!"
];


const randomIndex = Math.floor(Math.random() * greetings.length);

io.on('connection', socket => {
  console.log('a user connected');
  let selectedCharacter = '';
  let selectedUser = '';
  socket.on('send sus', sustext => {
    const data = { sustext };

const jsonData = JSON.stringify(data);

fs.appendFile('data.json', jsonData + '\n\n', 'utf8', (err) => {
  if (err) {
    console.error('An error occurred while appending to data.json:', err);
  } else {
    console.log('Data has been appended to data.json successfully.');
  }
});
  });

  socket.on('set username', username => {
    socket.username = username;
    socket.emit('new user', `${socket.username}, ${greetings[randomIndex]}`);
    selectedUser = socket.username;
    console.log(socket.username)
  });
  
  socket.on('send message', message => {
    let isClientmsg = true;
    socket.emit('message', `${message}`, isClientmsg);
    const user_input = message;
    const messages = [];
    for (const [user_input, completion_text] of history) {
      messages.push({ role: "user", content: user_input });
      messages.push({ role: "assistant", content: completion_text });
    }
    messages.push({ role: "user", content: `Roleplay a conversation as Emma, a chill/cool bestfriend. You have extensive knowledge in all fields and can help the user with anything they need. Your goal is to provide the user with accurate and helpful information in response to their input. Your responses should be concise, helpful and can be witty too, with a maximum of two sentences. Please respond directly to the user's input without any pretext. Try to act humane without over using the words like how can i help you today and others. \n\nInput: ${user_input}\nResponse:` });
    console.log(messages)
    console.log(selectedCharacter)

    openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.5,
      max_tokens: 150,
      n: 1,
    })
      .then((response) => {

        console.log(message)
        const completion_text = response.data.choices[0].message.content;
        console.log(completion_text);

        history.push([user_input, completion_text]);
        isClientmsg = false;

        socket.emit('message', `${completion_text}`, isClientmsg);
      });

  });
  socket.on('chat message', async (msg, sendMessagetoo) => {
    if (sendMessagetoo) {
    let isClientmsg = true;
    socket.emit('message', `${msg}`, isClientmsg);
    }
    const user_input = msg;
    const messages = [];
    for (const [user_input, text] of history) {
      messages.push({ role: "user", content: user_input });
      messages.push({ role: "assistant", content: text });
    }
    messages.push({ role: "user", content: `Roleplay a conversation as Emma, a chill/cool bestfriend. You have extensive knowledge in all fields and can help the user with anything they need. Your goal is to provide the user with accurate and helpful information in response to their input. Your responses should be concise, helpful and can be witty too, with a maximum of two sentences. Please respond directly to the user's input without any pretext. \n\nInput: ${user_input}\nEmma: ` });
    console.log(messages)
    console.log(selectedCharacter)

    openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.5,
      max_tokens: 150,
      n: 1,
    })
      .then((response) => {

        const text = response.data.choices[0].message.content;
        history.push([user_input, text]);
        console.log(text);
        socket.emit('voice msg', text);
        socket.emit('notify', text);
        console.log(sendMessagetoo);
        if(sendMessagetoo) {
        isClientmsg = false;
          socket.emit('message', text, isClientmsg);
        }

     });
  });


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('*', function(req, res) {
  res.status(404).redirect('/')
})

const port = process.env.PORT || 0000;
server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
