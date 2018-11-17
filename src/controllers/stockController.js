const mongoose = require('mongoose');
const Stock = require('../models/stockModel');


const createStock = function(request, response){

    const stock = new Stock({
        symbol : request.body.stockSymbol
    });

    stock.save()
    .then(function(createdStock){
        response.status(201).json({
            success : true,
            data : createdStock
        });
    }).catch(function(error){;
        response.status(500).json({
            success : false,
            error : error
        });
    });

}


const getStocks = function(request, response){

    Stock.find()
    .exec()
    .then(function(stocks){
        response.status(200).json({
            success : true,
            data : stocks
        });
    })
    .catch(function(error){
        response.status(500).json({
            success : false,
            error : error
        });
    })

}




module.exports.createStock = createStock;
module.exports.getStocks = getStocks;