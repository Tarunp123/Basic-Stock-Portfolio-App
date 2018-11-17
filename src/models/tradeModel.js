const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    stockId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'stock',
        required : true
    },
    quantity : {
        type : Number,
        required : true,
        validate : [Number.isInteger, "Quantity of stock must be an integer."]
    },
    price : {
        type : Number,
        required : true,
        min : 0.01
    },
    type : {
        type : String,
        enum : ['BUY', 'SELL'],
        required : true
    },
    portfolio : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'portfolio',
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'system.users',
        required : true
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    updatedAt : {
        type: Date,
        default: Date.now
    }
});

//Update updateAt field
tradeSchema.pre('save', function(next){
    //Validating new password
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('trade', tradeSchema);