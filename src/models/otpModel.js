const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const OTP_REGEX = /^[0-9]{6}$/;

const otpSchema = new Schema({
    email : {
        type : String,
        required : true,
        trim : true,
        validate : [EMAIL_REGEX, 'Please pass a valid email id.'],
        unique : true,
        index : true
    },
    otp : {
        type : String,
        required : true,
        trim : true,
        validate : [OTP_REGEX, 'Please enter a valid OTP']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('otp', otpSchema);