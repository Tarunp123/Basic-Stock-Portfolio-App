const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const tradeController = require('../controllers/tradeController');

//Get trades for a given holding
router.get('/:holdingId', checkAuth, function(req, res, next){
    res.send("GET on /trade/ called!");
});

//Add a new trade in user's portfolio
router.post('/', checkAuth, function(req, res, next){
    tradeController.processTradeRequest(req, res);
});

//Update an existing trade (if it exists) in user's portfolio.
router.put('/', checkAuth, function(req, res, next){
    tradeController.processUpdateTradeRequest(req, res);
});

//Delete an existing trade (if it exists) from user's portfolio.
router.delete('/', checkAuth, function(req, res, next){
    tradeController.deleteTrade(req, res);
});


//exporting route so that it is accessible outside this file
module.exports = router;