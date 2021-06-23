const User = require('./models/User.js');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jwt-simple');
const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
    const userData = req.body;

    const user = new User(userData);
    user.save((err, newUser) => {
        if (err) {
            // console.log('Saving user error');
            console.error(err);
            // res.status(500);
            return res.status(500).send({ message: 'Error saving user' })
        } else {
            createSendToken(res, newUser);
        }
    });
})

router.post('/login', async (req, res) => {
    const loginData = req.body;

    const user = await User.findOne({ email: loginData.email })
    if (!user) {
        return res.status(401).send({ message: 'Email invalid' })
        //original message: Email or password invalid
    }
    bcrypt.compare(loginData.pwd, user.pwd, (err, isMatch) => {
        if (!isMatch) {
            return res.status(401).send({ message: 'Password invalid' })
        }
        createSendToken(res, user);
    })
})

function createSendToken(res, user) {
    const payload = { sub: user._id }; //add userId into the payload to encrypt
    const token = jwt.encode(payload, '123');

    console.log(token); // token: header.payload.signature
    res.status(200).send({ token });
}


// Middleware to decode token for userId
const auth = {
    router,
    checkAuthenticated: (req, res, next) => {
        if (!req.header('authorization')) {
            return res.status(401).send({ message: 'Unauthorized. Missing Auth Header' });
        }
        const token = req.header('authorization').split(' ')[1];
        // console.log(token);
        const payload = jwt.decode(token, '123');

        if (!payload) {
            return res.status(401).send({ message: 'Unauthorized. Auth Header Invalid' })
        }
        req.userId = payload.sub;
        next();
    }
}

module.exports = auth
