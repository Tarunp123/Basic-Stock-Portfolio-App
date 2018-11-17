const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'system.users',
        required : true
    },
    name : {
        type : String,
        required : true,
        trim : true,
        match : [/^.{3,20}$/, 'Please enter a valid portfolio name'],   //name should be min 3 chars long 
        unique : true
    },
    description : {
        type : String,
        required : false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('portfolio', portfolioSchema);