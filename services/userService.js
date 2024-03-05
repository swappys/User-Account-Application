const User = require('../models/user');
const jwt = require('jsonwebtoken');

let refreshTokens=[];
exports.userUpdate = async (userId, updateBody) => {
    try {
        // Find the user in the database and then store it in user field
        const user = await User.findById(userId);

        if (!user) return { success: false, message: "User with that id was not found" };
        if (updateBody.email) return { success: false, message: "You cannot update the registered email address" };

        if (updateBody.firstName) user.firstName = updateBody.firstName;
        if (updateBody.lastName) user.lastName = updateBody.lastName;
        if (updateBody.password) user.password = updateBody.password;

        let userSaved = await user.save();
        
        return { success: true };
    } catch (err) {
        console.error("THERE WAS SOME ISSUE IN UPDATING THE USER");
        return { success: false, message: "User update failed" };
    }
};

exports.registerUser = async (userData) => {
    console.log(userData);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { firstName, lastName, password, email } = userData;

    // Validation of user input
    if (!firstName) return { success: false, message: "Name is required" };
    if (!password || password.length < 6) return { success: false, message: "Password is required and should be min 6 characters long" };

    let userExist = await User.findOne({ email }).exec();
    if (userExist) return { success: false, message: 'Email is taken' };

    //validate if the emailId is valid
    if(! regex.test(email)) return { success : false , message: 'Email is invalid'};

    // Register user if not exist
    const user = new User(userData);
    try {
        await user.save();
        console.log('USER CREATED', user);
        return { success: true };
    } catch (err) {
        console.error('CREATION OF THE USER HAS FAILED', err);
        return { success: false, message: 'Error. Try registering again' };
    }
};

exports.loginUser = async (email, password) => {
    try {
        //check id user entered email and password
        if(!password) return {success:false, message:"Please enter your password"};
        if(!email) return {success:false, message:"Please enter your email"};

        // First, check if the user with the email provided exists
        let user = await User.findOne({ email }).exec();
        if (!user) return { success: false, message: "User with that email was not found" };

        // Retrieve date from the database
        const storedDate = user.passwordChangeDate;
        // Capture the current date
        const currentDate = new Date();

        /** Set time to midnight for both currentDate and storedDate to consider only the
         * Date component without time.
         */
        storedDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        // Calculate the difference in milliseconds to get the difference
        const dateDifference = currentDate - storedDate;

        // Convert milliseconds to days
        const daysDifference = Math.floor(dateDifference / (1000 * 60 * 60 * 24));

        if (daysDifference > 30) {
            return { success: false, message: "Please consider changing your password to access the system" };
        }

        // If the user exists in the database, then compare the password
        return new Promise((resolve, reject) => {
            user.comparePasswords(password, (err, match) => {
                if (!match || err) {
                    resolve({ success: false, message: "Wrong password" });
                } else {
                    // If the passwords match, generate a JWT token
                    let token = generateAccessToken(user);
                    // Generate a refresh token
                    let refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_SECRET);
                    refreshTokens.push(refreshToken);
                    resolve({
                        success: true,
                        token,
                        refreshToken,
                        user: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt
                        }
                    });
                }
            });
        });
    } catch (err) {
        console.error("THERE WAS AN ERROR IN LOGGING IN", err);
        return { success: false, message: "Signin Failed" };
    }
};

exports.getUsers = async () => {
    try {
        // Find all the users in the database
        return await User.find();
    } catch (err) {
        console.error("THERE WAS SOME ISSUE IN GETTING THE USERS", err);
        throw new Error("Users fetch failed");
    }
};

exports.deleteaUser = async (userId) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        return deletedUser;
    } catch (err) {
        console.error("Error in deleting user:", err);
        throw new Error("User delete failed");
    }
};

exports.refreshTokenGenerator = (refreshToken) => {
    return new Promise((resolve, reject) => {
        
        if (refreshToken == null) {
            reject(401);
        }
        if (!refreshTokens.includes(refreshToken)) {
            reject(403);
        }
        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
            if (err) {
                reject(403);
            }
            const token = generateAccessToken(user);
            resolve(token);
        });
    });
};

exports.logout = (tokenToRemove) => {
    return new Promise((resolve, reject) => {
        try {
            if(!refreshTokens.includes(tokenToRemove))reject(403);
            refreshTokens = refreshTokens.filter(token => token !== tokenToRemove);
            resolve(200);
        } catch (error) {
            reject(error);
        }
    });
};

function generateAccessToken(user){
    const token=jwt.sign({_id: user._id},process.env.JWT_SECRET,{
        expiresIn: '30s' 
     });
     return token;
}
