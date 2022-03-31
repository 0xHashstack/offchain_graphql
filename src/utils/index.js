const jwt = require("jsonwebtoken");
require('dotenv').config()

const getToken = payload => {
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 604800, // 1 Week
    })
    return token
}

const getPayload = token => {
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return { loggedIn: true, payload };
    } catch (err) {
        return { loggedIn: false }
    }
}

module.exports = {
    getToken,
    getPayload
}
