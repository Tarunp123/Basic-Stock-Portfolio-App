const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockSchema = new Schema({
    symbol : {
        type : String,
        required : true,
        trim : true,
        validate : [/^.{2,20}$/, 'Please enter a valid Stock Symbol.'],  //symbol should be min 2 chars long 
        unique : true,
        index : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('stock', stockSchema);