const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const holdingSchema = new Schema({
   user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'system.users',
        required : true
   },
   portfolio : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'portfolio',
        required : true
   },
    stockId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'stock',
        required : true
   },
   quantity : {
       type : Number,
       required : true,
       validate : [Number.isInteger, "Quantity of stock must be an integer."],
       min : 0
   },
   buyTradeCount : {
       type : Number,
       default : 1
   },
   avgBuyingPrice : {
        type : Number,
        required : true         //required for initial buy value
   }
});


module.exports = mongoose.model('holding', holdingSchema);