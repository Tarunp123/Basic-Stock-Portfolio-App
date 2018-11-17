const mongoose = require('mongoose');
const Holding = require('../models/holdingModel');
const tradeController = require('../controllers/tradeController');

const getHoldingsInPortfolio = function(portfolioId, callback){
    
    //console.log("PORTFOLIO ID => ", portfolioId);
    
    Holding.find({portfolio : portfolioId})
    .populate('stockId')
    .exec()
    .then(function(holdings){
        //console.log("HOLDDSDD ", holdings);
        if(holdings.length == 0){
            const error = new Error();
            error.status = 404;
            error.message = "Could not find any holdings for specified portfolio!";
            callback(error, null);
            return;
        }

        callback(null, holdings);

    })
    .catch(function(error){
        //console.log("HOLDDSDD ERR", error);
        callback(error, null);
    });

}


const getHoldings = function(request, response){
    
    getHoldingsInPortfolio(request.params.portfolioId, function(error, holdings){
        if(error){
            response.status(500).json({
                success : false,
                error : error
            });
            return;
        }
        response.status(200).json({
            success : true,
            data : holdings
        });
    });
   
}


//Creates a new holding for a specified portfolio
//It should be called when trade is done for a new type of stock within a portfolio
//Response =>   Param1 : Error
//              Param2 : newly created Holding object
const createHolding = function(request, response, callback){

    const holding = new Holding({
        user : request.userData.id,
        portfolio : request.body.portfolioId,
        stockId : request.body.stockId,    
        quantity : request.body.quantity,
        avgBuyingPrice : request.body.price
    });

    holding.save()
    .then(function(createdHolding){

        //holding created successfully
        callback(null, createdHolding);

    }).catch(function(error){
        callback(error, null);
    });

}



//Updates holding data for a user's portfolio
//Resposne =>   Param1 : error
//              Param2 : updated holding object
const updateHoldingStats = function(request, response, callback){

    //console.log("UPDATE HOLDING CALLED!");
    const holdingQuery = {
        user : request.userData.id,
        portfolio : request.body.portfolioId,
        stockId : request.body.stockId
    };

    Holding.findOne(holdingQuery)
    .populate('stockId')
    .exec()
    .then(function(holding){
        //console.log("AFTE$R  EXEC", holding);
        if(holding == null){
            //Holding not found!
            //Create ne holding
            createHolding(request, response, function(error, newHolding){
                if(error){
                    callback(error, null);
                    return;
                }
                callback(null, newHolding);
                return;
            });
            // const error = new Error('Holding not found for specified stock and portfolio!');
            // error.status = 404;
            // callback(error, null);
            return;
        }

        //Update Avg Buying Price and increment buyTradeCount only for BUY trades
        if(request.body.tradeType === "BUY"){
            holding.avgBuyingPrice = (holding.avgBuyingPrice * holding.buyTradeCount + request.body.price)/(holding.buyTradeCount + 1);
            holding.buyTradeCount += 1;
            holding.quantity += request.body.quantity;
        }else{
            holding.quantity -= request.body.quantity;
        }

        
        

        holding.save()
        .then(function(updatedHolding){
            callback(null, updatedHolding);
        })
        .catch(function(error){
            callback(error, null);
        })

    })
    .catch(function(error){
        //console.log("HOLDING NOT FOUND!!!!", error);
        callback(error, null);
    })

}


const updateHoldingStatsReconsideringAllTrades = function(request, response, callback){

    const holdingQuery = {
        user : request.userData.id,
        portfolio : request.body.updatedTrade.portfolio,
        stockId : request.body.updatedTrade.stockId
    };

    //console.log("HOLDING QUERY => ", holdingQuery);

    Holding.findOne(holdingQuery)
    .exec()
    .then(function(holding){

        if(holding == null){
            //Could not find holding 
            //DATA IS NOT IN SYNC
            //SEND ALERT EMAIL TO ADMIN
            const error = new Error();
            error.status = 500;
            error.message = "Could not find holding of stock!"
            callback(error, null);
            return;
        }

        //holding found
        
        //compute the stats
        tradeController.generateStockHoldingStats(holding.user, holding.portfolio, holding.stockId._id, function(error, computedStats){
            
            holding.quantity = computedStats.quantity;
            holding.avgBuyingPrice = computedStats.avgBuyingPrice;
            holding.quantity = computedStats.quantity;
            
            holding.save()
            .then(function(updatedHolding){
                callback(null, updatedHolding);
            })
            .catch(function(error){
                //console.log(error);
                callback(error, null);
            });

        });


    })
    .catch(function(error){
        //console.log("EREER -> ", error);
        callback(error, null);
    });

} 


//Return holdings of a particular stock in particular portfolio
const getHoldingsOfStock = function(portfolioId, stockId, callback){
    //console.log(portfolioId);
    Holding.findOne({portfolio : portfolioId, stockId: stockId})
    .populate('stockId')
    .exec()
    .then(function(holding){
        if(holding == null){
            const error = new Error();
            error.status = 404;
            error.message = "Could not find holding of specified stock in specified portfolio!";
            callback(error, null);
            return;
        }
        callback(null, holding);
    })
    .catch(function(error){
        callback(error, null);
    });

}

module.exports.getHoldingsInPortfolio = getHoldingsInPortfolio;
module.exports.getHoldings = getHoldings;
module.exports.createHolding = createHolding;
module.exports.updateHoldingStats = updateHoldingStats;
module.exports.updateHoldingStatsReconsideringAllTrades = updateHoldingStatsReconsideringAllTrades;
module.exports.getHoldingsOfStock = getHoldingsOfStock;