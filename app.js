const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes'); 
const portfolioRoutes = require('./src/routes/portfolioRoutes');
const holdingRoutes = require('./src/routes/holdingRoutes');
const stockRoutes = require('./src/routes/stockRoutes');
const tradeRoutes = require('./src/routes/tradeRoutes');

//creating an Express App.
const app = express();

//Setting env variables
process.env.PORT = 3000;
process.env.MOGODB_URI = 'mongodb://localhost/StockPortfolioDB';
process.env.JWT_SECRET = 'Asd*@N!@an=-190wbna:AA#@';

//Connecting to MongoDB 
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MOGODB_URI);


//Setting which body types we want body-parser to parse and convert to JSON
app.use(bodyParser.urlencoded({extended : false})); //extended set to false, to only allow url-encoded data to be parsed.
app.use(bodyParser.json());


//preventing CORS errors
app.use(function(request, response, next){
    
    //from where can client send request to our server
    //currently set to '*'  i.e from anywhere
    response.header('Access-Control-Allow-Origin', '*');
    
    //which headers can be present in any request made by the client
    //currently set to '*'  i.e from any header
    response.header('Access-Control-Allow-Headers', '*');
    
    //Checking if this the request made by client to check if it can make a request
    if(request.method === 'OPTIONS'){
        //Yes. This request is made to check if client can make a request

        //Setting what kind of requests client can make.
        response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

        //Sending 200 OK response to client
        response.status(200).json({});
        return;
    }

    //No. this is an actual request. So passing request to other routes.
    next();
});

//Handling requests to /user/*
app.use('/user', userRoutes);

//Handling requests to /stocks/*
app.use('/stocks', stockRoutes);

//Handling requests to /portfolio/*
app.use('/portfolio', portfolioRoutes);

//Handling requests to /holding/*
app.use('/holding', holdingRoutes);

//Handling requests to /trade/*
app.use('/trade', tradeRoutes);

//Handling root requests
app.use('/', portfolioRoutes);

//Handling requests to any other endpoint.
app.use(function(request, response, next){
    const error = new Error('Not Found!');
    error.status = 404;
    next(error);
});

//Error Handling
app.use(function(error, request, response, next){
    response.status(error.status || 500).json({
        success : false,
        error : {
            message : error.message
        }
    });
});


module.exports = app;
