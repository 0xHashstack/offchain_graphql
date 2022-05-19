require('dotenv').config({ path: require('find-config')('.env') })
const jwt = require("jsonwebtoken");
const {JWT_EXPIRY_TIME, REFRESH_TOKEN_EXPIRY_TIME} = require('../../constants/constants')

const getAccessToken = payload => {
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || 'JUST_A_RANDOM_ACCESS_TOKEN_SECRET', {
        expiresIn: JWT_EXPIRY_TIME
    })
    return token
}

const getPayload = token => {
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'JUST_A_RANDOM_ACCESS_TOKEN_SECRET');
        return { loggedIn: true, payload };
    } catch (err) {
        return { loggedIn: false }
    }
}

const createRefreshToken = payload => {
    return jwt.sign( payload,process.env.REFRESH_TOKEN_SECRET || 'JUST_A_RANDOM_REFRESH_TOKEN_SECRET',{
        expiresIn: REFRESH_TOKEN_EXPIRY_TIME 
      }
    );
  };

const sendRefreshToken = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: "/refresh_token"
  });
};

module.exports = {
    getAccessToken,
    getPayload,
    createRefreshToken,
    sendRefreshToken
}
