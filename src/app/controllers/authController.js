const express = require('express')
const User = require('../models/user')
const router = express.Router()
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mailer = require('../../modules/mailer')
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
    const token = generateTokenJWT({ id: user.id })

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
        const token = generateTokenJWT({ id: user.id })

        return res.send({ user, token })
    } catch (err) {
        console.error(err)
        return res.status(400).send({ error: 'Registration failed.' })     
    }
})


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email })
        
        if (!user)
            res.status(400).send({error: 'User not found.'})

        const token = generateRandomTokenCrypto()
        const expiresToken = new Date()
        expiresToken.setHours(expiresToken.getHours() + 1)

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: expiresToken
            }
        })

        mailer.sendMail({
            to: email,
            from: 'murilovictor63@gmail.com',
            template: 'auth/forgot-password',
            context: { token },
        }, (err) => {
            if (err)
                return res.status(400).send({error: 'Cannot send forgot password email. Try again.'})

            return res.send()
        })

    } catch (err) {
        return res.status(400).send({error: 'Erro on forgot password, try again.'})
    }

})


router.post('/reset-password', async (req, res) => {
    const { email, token, password } = req.body

    try {
        
        const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')
        
        if (!user)
            res.status(400).send({error: 'User not found.'})

        if (token !== user.passwordResetToken)
            res.status(400).send({error: 'Token invalid.'})

        if (new Date() > user.passwordResetExpires)
            res.status(400).send({error: 'Token expired, generate a new one.'})

        user.password = password;

        await user.save()

        res.send()
        
    } catch (err) {
        return res.status(400).send({error: 'Cannot send reset password. Try again.'})
    }
})

function generateTokenJWT(params = {}) {
    return jwt.sign({ params }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
    })
}

function generateRandomTokenCrypto() {
    return crypto.randomBytes(20).toString('hex')
}

module.exports = app => app.use('/auth', router)