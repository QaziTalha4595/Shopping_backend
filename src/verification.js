const secretkey = "secretkey";
const jwt = require('jsonwebtoken');


const verification = (req, res, nxt) => {
    const token = req.headers.token ;

    
    if (!token) {
        return res.json({ success: false, message: "A token is required for authentication" })
    }

    try {

        const decoded = jwt.verify(token, secretkey);
        req.user = decoded;

        
    } catch (er) {

        // console.log(er)
        return res.json({ success: false, message: "Something went wrong", err: er });
    }

    return nxt();
};

module.exports = verification;