const express = require('express')
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')


router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne( { email }).select('+password')

    if(!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send({ error: 'User or Password invalid.' })
    }

    // removendo password
    user.password = undefined

    // generate Token
    const token = generateToken({ id: user.id })

    res.send ({ user, token }, )
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

        // generate Token
        const token = generateToken({ id: user.id })

        return res.send({ user, token })
    } catch (err) {
        console.error(err)
        return res.status(400).send({ error: 'Registration failed.' })     
    }
})

function generateToken(params = {}) {
    return jwt.sign({ params }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
    })
}

module.exports = app => app.use('/auth', router)