const jwt = require("jsonwebtoken");


const getAccessToken = payload => {
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 900, // 15 minutes
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

const createRefreshToken = payload => {
    return jwt.sign( payload,process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "28d" // 28 days expiry 
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
