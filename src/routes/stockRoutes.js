const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const stockController = require('../controllers/stockController');

//Get all stocks
router.get('/', checkAuth, function(req, res, next){
    stockController.getStocks(req, res);
});

//Add a new stock
router.post('/', checkAuth, function(req, res, next){
    stockController.createStock(req, res);
});

//Update an existing stock (if it exists).
router.put('/', checkAuth, function(req, res, next){
    res.send("PUT on /stocks/ called!");
});

//Delete an existing stock (if it exists)
router.delete('/', checkAuth, function(req, res, next){
    res.send("DELETE on /stocks/ called!");
});


//exporting route so that it is accessible outside this file
module.exports = router;