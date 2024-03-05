// import jwt from 'jsonwebtoken';
const jwt = require('jsonwebtoken');
const { userUpdate, registerUser, loginUser, getUsers, deleteaUser, refreshTokenGenerator, logout} = require('../services/userService');

let refreshTokens=[]
exports.register = async(req, res)=>{
    try {
        const result = await registerUser(req.body);
        if (result.success) {
            return res.json({ ok: true });
        } else {
            return res.status(400).send(result.message);
        }
    } catch (err) {
        console.error("ERROR IN REGISTERING THE USER", err);
        return res.status(500).send("Internal Server Error");
    }
}

exports.login = async(req, res)=>{
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        console.log(result);
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).send(result.message);
        }
    } catch (err) {
        console.error("ERROR IN LOGGING IN", err);
        return res.status(500).send("Internal Server Error");
    }
};


exports.getAllUsers = async(req, res)=>{
    try {
        let users = await getUsers();
        res.send(users);
    } catch (err) {
        console.error("ERROR IN GETTING THE USERS", err);
        res.status(400).send("Users fetch failed");
    }
};

exports.updateUser = async(req, res)=>{
    try {
        let userId = req.params.id;
        let updateBody = req.body;

        const result = await userUpdate(userId, updateBody);

        if (result.success) {
            res.json({ ok: true });
        } else {
            res.status(400).send(result.message);
        }
    } catch (err) {
        console.error("THERE WAS AN ERROR IN UPDATING THE USER", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.deleteUser = async(req, res)=>{
    try {
        let userId = req.params.id;
        const deletedUser = await deleteaUser(userId);

        if (!deletedUser) {
            return res.status(400).send("User with that id was not found");
        }

        return res.status(200).send("User deleted");
    } catch (err) {
        console.error("Error in deleting user:", err);
        return res.status(400).send("User delete failed");
    }
};
exports.refreshToken = async(req,res)=> {
    try {
        const refreshTokenValue = req.body.refreshToken;
        const token = await refreshTokenGenerator(refreshTokenValue);

        res.json({token:token});
    } catch (errCode) {
        if (errCode === 401) {
            res.sendStatus(401);
        } else if (errCode === 403) {
            res.status(403).send("Invalid refresh token");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
};

exports.logoutUser = async(req, res)=>{
    try {
        const tokenToRemove = req.body.token;
        const updatedTokens = await logout(tokenToRemove);
        res.status(200).send("User loggedout successfully");
    } catch (err) {
        if (err === 403) {
            res.status(403).send("Invalid refresh token");
        } 
        else{
        res.status(500).send("Internal Server Error");
        }
    }
};

function generateAccessToken(user){
    const token=jwt.sign({_id: user._id},process.env.JWT_SECRET,{
        expiresIn: '30s' 
     });
     return token;
}
