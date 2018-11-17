const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/;

const userSchema = new Schema({
    firstName : {
        type : String,
        required : false,
        trim : true
    },
    lastName : {
        type: String,
        required : false,
        trim : true
    },
    email: {
        type : String,
        required : [true, 'Please enter your email id'],
        trim : true,
        lowercase : true,
        unique : true,
        match : [EMAIL_REGEX, 'Please enter a valid email id']
    }, 
    password: {
        type : String,
        required: String,
        trim: true,
        match : [PASSWORD_REGEX, "Please enter a strong password with atleast 1 uppercase, 1 lowercase, 1 number and 1 special character."]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


/* 

//This won't help because we are saving hashed values into DB.

userSchema.pre('save', function(next){
     //Validating new password
     if(PASSWORD_REGEX.match(passwordRegex) == null){
        //invalid password
        const error = new Error('Not Found!');
        error.status = 406;
        next(error);
     }else{
        next();
     }  
}); */


module.exports = mongoose.model('system.users', userSchema);