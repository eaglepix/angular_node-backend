const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jwt-simple');
const app = express();

const mongoose = require('mongoose');
const port = process.env.PORT || 3000; // Boolean: if main port fails use backup port 3000
const mongoURL = 'mongodb+srv://demo1234:1MpRrCpvHeDf1lRL@pydot16.tafgx.mongodb.net/pssocial?retryWrites=true&w=majority'
//process.env.MONGODB_URL;

const User = require('./models/User.js');
const Post = require('./models/Post.js');
const auth = require('./auth.js');

app.use(cors());
app.use(bodyParser.json());



app.get('/', (req, res) => {
    res.send('hello world')
});

app.get('/posts/:id', async (req, res) => {
    const author = req.params.id;
    const posts = await Post.find({author});
    res.send(posts);
});

app.post('/post', auth.checkAuthenticated, (req, res) => {
    const postData = req.body;
    postData.author = req.userId;

    const post = new Post(postData);

    post.save((err, result) => {
        if (err) {
            console.log('Saving post error');
            console.error(err);
            res.status(500).send({message: 'saving post error'});
        } else {
            res.status(200);
        }
    });
})

app.get('/users', async (req, res) => {
    try {
        console.log(req.userId);
        const users = await User.find({}, '-pwd -__v'); // minus off those fields we don't want
        res.send(users);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.get('/profile/:id', async (req, res) => {
    // console.log(req.params.id);
    try {
        const user = await User.findById(req.params.id, '-pwd -__v'); // minus off those fields we don't want
        res.send(user);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

});

// app.post('/register', auth.register);  //originally with module.exports from auth.js

// app.post('/login', auth.login)
    // if (loginData.pwd != user.pwd) {
    //     return res.status(401).send({ message: 'Password invalid' })
    // }
    // Token authentication module here:



options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(mongoURL, options, (err) => {
    if (!err)
        console.log('connected to Mongo')
});

app.use('/auth', auth.router);
app.listen(3000);