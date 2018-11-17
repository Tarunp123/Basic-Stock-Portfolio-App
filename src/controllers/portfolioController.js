const mongoose = require('mongoose');
const Portfolio = require('../models/portfolioModel');
const holdingController = require('../controllers/holdingController');

const getPortfolio = function(request, response){
    
    //Assuming there is only one portfolio for a user.
    //We will get all the holdings present in the portfolio.

    //First get the porfolio for user
    Portfolio.findOne({'user' : request.userData.id})
    .populate({path : 'user', select : 'firstName lastName email'})
    .exec()
    .then(function(portfolio){

        //Checking if portfolio is found
        if(portfolio == null){
            //Not found
            response.status(404).json({
                success : false,
                error : {
                    message : "Couldn't find any portfolio!"
                }
            });
            return;
        }

        //Portfolio found
       //console.log("PORTFOLIO FOUND => ", portfolio);

        //Get data from holdingController
        holdingController.getHoldingsInPortfolio(portfolio._id, function(error, holdings){

           //console.log(error, holdings);
            //Error handling
            if(error && error.status != 404){
                response.status(500).json({
                    success : false, 
                    error : error
                });
                return;
            }

            //Converting mongoose object to JSON object to add additional key value pair in it.
            var responseData = portfolio.toObject();
            
            //adding all the holdings in portfolio object
            responseData['holdings'] = holdings == null ? [] : holdings;

            response.status(200).json({
                success : true,
                data : responseData
            });
        });

    }).catch(function(error){
        response.status(500).json({
            success : false,
            error : error
        });
    })

}



const createPortfolio = function(request, response){
   //console.log('CREATE PORTFOLIO USER DATA ->' , request.userData);
    const portfolio = new Portfolio({
        user : request.userData.id,
        name : request.body.portfolioName,
        description : request.body.description
    });

    portfolio.save()
    .then(function(createdPortfolio){

        //console.log('PORTFOLIO CREATED ->', createdPortfolio);
        
        response.status(201).json({
            success : true,
            data : createdPortfolio
        });

    }).catch(function(error){
        response.status(500).json({
            success : false,
            error : error
        }); 
    });

}


const getReturns = function(request, response){

    //Assuming only 1 portfolio per user
    //First get all the holdings in Portfolio

   //First get the porfolio for user
    Portfolio.findOne({'user' : request.userData.id})
    .populate({path : 'user', select : 'firstName lastName email'})
    .exec()
    .then(function(portfolio){

        //Checking if portfolio is found
        if(portfolio == null){
            //Not found
            response.status(404).json({
                success : false,
                error : {
                    message : "Couldn't find any portfolio!"
                }
            });
            return;
        }

        //Portfolio found

        //Get data from holdingController
        holdingController.getHoldingsInPortfolio(portfolio._id, function(error, holdings){

            //Error handling
            if(error){
                response.status(500).json({
                    success : false, 
                    error : error
                });
                return;
            }

            //Currently just adding amount invested in each portfolio and returning total investment amount.
            var totalPortfolioValue = 0;
            for(var index = 0; index < holdings.length; index++){
                totalPortfolioValue += holdings[index].quantity * holdings[index].avgBuyingPrice;
            }

            response.status(200).json({
                success : true,
                data : {
                    returns : totalPortfolioValue
                }
            });
            
        });

    }).catch(function(error){
        response.status(500).json({
            success : false,
            error : error
        });
    })

}



module.exports.getPortfolio = getPortfolio;
module.exports.createPortfolio = createPortfolio;
module.exports.getReturns = getReturns;