const Joi = require("joi")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

function authenticateWithRole(userRole, JWT) {
    if (authenticateJWT(JWT)) {
        var token = ""
        try {
            token = jwt.decode(JWT)
        } catch (e) {
            console.log(e)
            return false
        }
        if (Array.isArray(userRole)) {
            for (var i = 0; i < userRole.length; i++) {
                if (token.user_role === userRole[i]) {
                    return true
                }
            }
            return false
        } else {
            if (token.user_role === userRole) {
                return true
            } else {
                return false
            }
        }
    } else {
        return false
    }
}

function authenticateJWT(JWT) {
    try {
        jwt.verify(JWT, process.env.JWTPRIVATEKEY)
    } catch (e) {
        console.log(e.message)
        return false
    }
    return true
}

module.exports = {
    authenticateWithRole,
    authenticateJWT
}