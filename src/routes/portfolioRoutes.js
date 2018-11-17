const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const portfolioController = require('../controllers/portfolioController');


//Get all portfolios of user
router.get('/', checkAuth, function(req, res, next){
    portfolioController.getPortfolio(req, res);
});

//Get returns of portfolio
router.get('/returns', checkAuth, function(req, res, next){
    portfolioController.getReturns(req, res);
});

//Add a new portfolio
router.post('/', checkAuth, function(req, res, next){
    portfolioController.createPortfolio(req, res);
});

//Update an existing portfolio (if it exists).
router.put('/', checkAuth, function(req, res, next){
    res.send("PUT on /portfolio/ called!");
});

//Delete an existing portfolio (if it exists)
router.delete('/', checkAuth, function(req, res, next){
    res.send("DELETE on /portfolio/ called!");
});


module.exports = router;