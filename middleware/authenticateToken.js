require("dotenv").config();
const jwt = require('jsonwebtoken');

//authentication middleware to check if the token is valid and correct
function authenticateToken(req,res,next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET,(err, user)=>{
        if(err) return res.status(403).send("The access token is invalid");
        req.user = user
        next()
    })
}
module.exports=authenticateToken;