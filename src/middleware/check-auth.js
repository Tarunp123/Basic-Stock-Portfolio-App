const jwt = require('jsonwebtoken');

const checkAuth = function(request, response, next){

    //check if authorization header is passed
    if(request.headers.authorization == null || request.headers.authorization.split(' ').length != 2){
        response.status(401).json({
            success : false,
            message : "Authorization Failed!"
        });
        return;
    }

    //Extract token from request header
    var token = request.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, function(error, decoded){

        //Checking for error
        //Error can also be if token is invalid or expired. 
        if(error){
            response.status(401).json({
                success : false,
                error : error
            });
            return;
        }

        //Save userdata in request header
        request.userData = decoded;

        //move to next step
        next();
    });

}


module.exports = checkAuth;