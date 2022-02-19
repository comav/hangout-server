const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const User = require('./schemas/user');

require('dotenv').config();

const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_USER_PASSWORD}@hangoutdb.yrbcj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

mongoose.connect(url);
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', console.error.bind(console,  'MongoDB connection error:'));

const saltRounds = 10;

app.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({email});

    if (oldUser) {
      return res.status(409).send("User already exists, use login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword
    })

    const token = jwt.sign(
      { user_id: user._id, email},
      process.env.TOKEN_KEY, 
      {
        expiresIn: '2h',
      }
    )

    user.token = token;

    res.status(201).json(user);
  } catch (e) {
    console.log(e);
  }
})

app.post('/login', async (req, res) => {
  try {

    const {email, password} = req.body;

    if (!(email && password)) {
      res.status(400).send('All input is required!');
    }

    const user = await User.findOne({email: email});

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    }
    res.status(404).send('User wasnt found')
  } catch (error) {
    console.log(error);
  }
})

app.post('/edit-profile', async (req, res) => {
  const {job, app_aim, interests, university_degree, email} = req.body;

  const update = {
    job: job,
    app_aim: app_aim,
    interests: interests,
    university_degree: university_degree
  }

  const user = await User.findOneAndUpdate({email: email}, update)

  res.status(200).json(user);
})

app.listen(8642, () => {
  console.log('Server is up!')
})