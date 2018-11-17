const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const holdingController = require('../controllers/holdingController');

//Get all holdings of user for a specific portfolioId
router.get('/:portfolioId', checkAuth, function(req, res, next){
    holdingController.getHoldings(req, res);
});

//Add a new holding in porfolio
router.post('/', checkAuth, function(req, res, next){
    res.send("POST on /holding/ called!");
});

//Update an existing holding (if it exists) in a portfolio
router.put('/', checkAuth, function(req, res, next){
    res.send("PUT on /holding/ called!");
});

//Delete an existing holding (if it exists) in a portfolio
router.delete('/', checkAuth, function(req, res, next){
    res.send("DELETE on /holding/ called!");
});


module.exports = router;