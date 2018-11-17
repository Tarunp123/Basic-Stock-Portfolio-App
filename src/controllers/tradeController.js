const mongoose = require('mongoose');
const Trade = require('../models/tradeModel');
const holdingController = require('../controllers/holdingController');


const processTradeRequest = function(request, response){

    if(request.body.tradeType === "SELL"){
        holdingController.getHoldingsOfStock(request.body.portfolioId, request.body.stockId, function(error, holding){

            if(error){
                //Either user doesn't have any holding of stock or some error occured
                response.status(500).json({
                    success : false,
                    error : error
                });
                return;
            }
    
            if(holding.quantity >= request.body.quantity){
                createTrade(request, response);
            }else{
                response.status(400).json({
                    success : false,
                    error : {
                        message : "You don't have sufficicent stocks!"
                    }
                });
            }
    
        });
    }else{
        createTrade(request, response);
    }

}


const createTrade = function(request, response){
    
    const trade = new Trade({
        stockId : request.body.stockId,
        quantity : request.body.quantity,
        price : request.body.price,         //NOTE: Price should be taken from some other API!
        type : request.body.tradeType,
        portfolio : request.body.portfolioId,
        user : request.userData.id
    });

    trade.save()
    .then(function(createdTrade){
        holdingController.updateHoldingStats(request, response, function(error, updatedHolding){
             //returning success 
            if(error){
                //Stats update failed!
                //Send an alert email to Admin or do something else!
            }

            response.status(200).json({
                success : true,
                data : createdTrade
            });

        });
    }).catch(function(error){;
        response.status(500).json({
            success : false,
            error : error
        });
    });

}

const processUpdateTradeRequest = function(request, response){

    Trade.findById(request.body.tradeId)
    .exec()
    .then(function(trade){
        
        if(trade == null){
            //trade not found
            response.status(404).json({
                success : false,
                error :  {
                    message : "Could not find Trade with specified Id!"
                }
            });
            return;
        }
        
        //trade found
        //console.log("TRADE FOUND =>", trade);

        //Save ref to trade object in request object
        request.body.trade = trade;

        if(trade.type === "SELL"){
            //Check if extra stocks are present in account or not.

            //Get total holdings of stock from portfolio
            holdingController.getHoldingsOfStock(trade.portfolio, trade.stockId, function(error, holding){

                if(error){
                    //Either user doesn't have any holding of stock or some error occured
                    response.status(500).json({
                        success : false,
                        error : error
                    });
                    return;
                }
        
                if(holding.quantity >= Math.abs(request.body.quantity - trade.quantity)){
                    updateTrade(request, response);
                }else{
                    response.status(400).json({
                        success : false,
                        error : {
                            message : "You don't have sufficicent stocks!"
                        }
                    });
                }
        
            });


        }else{
            updateTrade(request, response);
        }


    })
    .catch(function(error){
        response.status(500).json({
            success : false,
            error :  error
        })
    });


}


const updateTrade = function(request, response){

        const trade = request.body.trade;

        //Update quantity if new value is sent
        if(request.body.quantity != null){
            trade.quantity = request.body.quantity;
        }

        //Update quantity if new value is sent
        if(request.body.price != null){
            trade.price = request.body.price;
        }

        //Save updates
        trade.save()
        .then(function(updatedTrade){
            //did save updates
            request.body.updatedTrade = updatedTrade;
            holdingController.updateHoldingStatsReconsideringAllTrades(request, response, function(error, updatedHolding){
                //returning success 
                if(error){
                    //Stats update failed!
                    //Send an alert email to Admin or do something else!
                }

                response.status(200).json({
                    success : true,
                    data : updatedTrade
                });
            
            });

        }).catch(function(error){
            //console.log(error);
            response.status(500).json({
                success : false,
                error :  error
            })
        });

}


const deleteTrade = function(request, response){

    Trade.findByIdAndRemove(request.body.tradeId)
    .exec()
    .then(function(deletedTrade){
        
        //console.log("DELETED TRADE => ", deletedTrade);

        if(deletedTrade == null){
            //trade not found
            response.status(404).json({
                success : false,
                error :  {
                    message : "Could not find Trade with specified Id!"
                }
            });
            return;
        }
        
        //trade found and deleted
        request.body.updatedTrade = deletedTrade;
        holdingController.updateHoldingStatsReconsideringAllTrades(request, response, function(error, updatedHolding){
            //returning success 
            if(error){
                //Stats update failed!
                //Send an alert email to Admin or do something else!
            }

            response.status(200).json({
                success : true,
                data : deletedTrade
            });
        
        });

    })
    .catch(function(error){
        response.status(500).json({
            success : false,
            error :  error
        })
    });

}


const generateStockHoldingStats = function(userId, portfolioId, stockId, callback){

    Trade.aggregate([
        {$match : {$and : [{ user : {$eq : mongoose.Types.ObjectId(userId)}},
                        {portfolio: {$eq : mongoose.Types.ObjectId(portfolioId)}},
                        {stockId : {$eq : mongoose.Types.ObjectId(stockId)}},
                        {type : {$eq : 'BUY'}}]}},
        { $group: {
            _id: '$stockId',
            avgBuyingPrice: { $avg: '$price'},
            buyTradeCount : {$sum : 1}
        }}
    ], function(error, result){
       //console.log("ERROR1 => ", error);
       //console.log("RESULT1 => ", result);
        if(error){
            callback(error, null);
            return;
        }
        
        //Find Quantity of BUY and SELL trade respectively
        Trade.aggregate([
            {$match : {$and : [{ user : {$eq : mongoose.Types.ObjectId(userId)}},
                            {portfolio: {$eq : mongoose.Types.ObjectId(portfolioId)}},
                            {stockId : {$eq : mongoose.Types.ObjectId(stockId)}}]}},
            { $group: {
                _id: '$type',
                quantity : {$sum : '$quantity'}
            }}
        ], function(error1, result1){
           //console.log("ERROR2 => ", error1);
           //console.log("RESULT2 => ", result1);
            if(error1){
                callback(error1, null);
                return;
            }

            const response = {};
            response['stockId'] = stockId;
            if(result.length == 0){
                //No BUY trades  
                response['avgBuyingPrice'] = 0;
                response['buyTradeCount'] = 0;
            }else{
                response['avgBuyingPrice'] = result[0].avgBuyingPrice;
                response['buyTradeCount'] = result[0].buyTradeCount;
            }
            
            if(result1.length == 0){
                //No trades of any type
                response['quantity'] = 0;
            }else{
                var finalQuantity = result1[0].quantity;
                if(result1.length == 2){
                    finalQuantity -= result1[1].quantity;
                }
                response['quantity'] = Math.abs(finalQuantity);
            }
        
            callback(null, response);
        });

    
    });

}






module.exports.generateStockHoldingStats = generateStockHoldingStats;
module.exports.processTradeRequest = processTradeRequest;
module.exports.processUpdateTradeRequest = processUpdateTradeRequest;
module.exports.deleteTrade = deleteTrade;