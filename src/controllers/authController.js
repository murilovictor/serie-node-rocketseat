const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs')


router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne( { email }).select('+password')

    if(!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send({ error: 'User or Password invalid.' })
    }

    // removendo password
    user.password = undefined

    res.send ({ user })
})



router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {

        if(await User.findOne({ email })){
            return res.status(400).send({ error: 'User already exists.' })
        }

        const user = await User.create(req.body);
        
        // remove password
        user.password = undefined;

        return res.send({ user })
    } catch (err) {
        console.error(err)
        return res.status(400).send({ error: 'Registration failed.' })     
    }
})

module.exports = app => app.use('/auth', router)