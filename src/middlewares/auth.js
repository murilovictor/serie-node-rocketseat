const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).send({ error: 'No Token provided.' })
    }

    const parts = authHeader.split(' ')

    if (!parts.length === 2) {
        return res.status(401).send({ error: 'Token error.' })
    }

    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ error: 'Token error.' })
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Token invalid.' })
        }

        // adicionando o id do usuário nas requisições
        req.userId = decoded.params.id

        return next()
    })


}