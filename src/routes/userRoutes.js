const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const userController = require('../controllers/userController');

//Sign-up a user
router.post('/signup', function(req, res, next){
    userController.handleUserRegistrationProcess(req, res);
});

//Get User Details
router.post('/details', checkAuth, function(req, res, next){
    userController.getUserDetails(req, res);
});

//Login a user
router.post('/login', function(req, res, next){
    userController.userLogin(req, res);
});

//Update an existing user's password.
router.put('/updatePassword', checkAuth, function(req, res, next){
    userController.updatePassword(req, res);
});



//exporting routes so that it is accessible outside this file
module.exports = router;