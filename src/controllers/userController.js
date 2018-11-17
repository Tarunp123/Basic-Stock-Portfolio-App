const mongoose = require('mongoose');
const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const passwordGenerator = require('generate-password');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//generates a string of random digits of specified length.
const generateRandonDigitStringOfLength = function(length){
    if(length == null) return null;
    var otp = '';
    for(var count = 0; count < length; count++){
        var randomDigit = Math.floor((Math.random() * 9)+1);
        otp += randomDigit;
    }
    return otp;
}


const findAndRemoveAnExistingOTPForEmail = function(email, callback){
    OTP.findOneAndRemove(email)
    .exec()
    .then(function(deletedOTP){

        callback(null, deletedOTP);
        
    }).catch(function(error){
        //console.log(error);
        callback(error, null);
    });
}


//User Signup
const handleUserRegistrationProcess = function(request, response){

    //Checking if request has OTP
    if(request.body.otp != null){
        //Check if OTP is correct

        //Remove existing OTP from DB and use it to compare passed OTP
        findAndRemoveAnExistingOTPForEmail(request.body.email, function(error, deletedOTP){

            if(error){
                response.status(500).json({
                    success : false,
                    message : "Sorry! We are facing some internal issue! Please try again in sometime!"
                });
                return;
            }

            if(deletedOTP == null){
                response.status(401).json({
                    success : false,
                    message : "You have not generated any OTP! Please generate one first and retry signing up!"
                });
                return;
            }

            if(deletedOTP.otp == request.body.otp){
                //Correct OTP was supplied
                //Complete Registration
                userSignup(request, response);
            }else{
                //incorrect OTP was supplied
                response.status(401).json({
                    success : false,
                    message : "Incorrect OTP! Please generate another OTP and retry signing up!"
                });
            }

        });


    }else{
        //This is the first request.
        //Generate an OTP, save in DB and return it back to client

        //Before that remove existing OTP from DB
        findAndRemoveAnExistingOTPForEmail(request.body.email, function(error, deletedOTP){

            if(error){
                response.status(500).json({
                    success : fale,
                    message : "Sorry! We are facing some internal issue! Please try again in sometime!"
                });
                return;
            }

            const otp = new OTP({
                email : request.body.email,
                otp : generateRandonDigitStringOfLength(6)
            });
            otp.save()
            .then(function(savedOtp){
                //OTP is saved
                //Send it to client
                response.status(201).json({
                    success : true,
                    data : {
                        email : savedOtp.email,
                        otp : savedOtp.otp
                    }
                });
            }).catch(function(error){
                res.status(500).json({
                    success : false,
                    error : error
                });
            });

        });
        
    }

}

const userSignup = function(req, res){

    const newPassword = passwordGenerator.generate({
        length : 6,
        numbers : true,
        symbols : true,
        uppercase : true,
        exclude : '"`_:\'\\,./',
        strict : true
    });

    bcrypt.hash(newPassword, 10, function(error, hash){
        if(error){
            //Could not hash the password due to some reason.
            //console.log("ERROR IN HASHING PASSWORD -> ", error);
            res.status(500).json({
                success : false,
                error : error
            });
            return;
        }

        //console.log("firstName", req.body.firstName);
        //console.log("lastName", req.body.lastName);
        //console.log("Email", req.body.email);
        
        const newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            password : hash
        });


        newUser.save().then(function(result){
            //console.log("USER CREATED -> ", result);

            //generating 6 digit OTP
            const otp = generateRandonDigitStringOfLength(6);

            res.status(201).json({
                success : true,
                data : {
                    email : result.email,
                    defaultPassword : newPassword
                } 
            });
        }).catch(function(err){
            //console.log("ERROR CREATING NEW USER -> ", err);
            res.status(500).json({
                success : false,
                error : err
            });
        });
        
        
    });
    
}


//Update user password
const updatePassword = function(request, response){

    const currentPassword = request.body.currentPassword;
    const newPassword = request.body.newPassword;
    const confirmPassword = request.body.confirmPassword;

    //Checking if any of the 4 parameters (email, currentPassword, newPassword, confirmPassword) is missing
    if(request.body.email == null || currentPassword == null || newPassword == null || confirmPassword == null){
        //atleast 1 param is missing.
        response.status(406).json({
            success : false,
            error : {
                message : "Please enter all the mandatory fields!"
            }
        });
        return;
    }

    //checking if new password and confirm password is same.
    if(newPassword !== confirmPassword){
        //not same.
        response.status(422).json({
            success : false,
            error : {
                message : "New password and Confirm password don't match!"
            }
        });
        return;
    }


    //Validating new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/;
    if(newPassword.match(passwordRegex) == null){
        //invalid password
        response.status(406).json({
            success : false,
            error : {
                message : "Please enter a strong password with atleast 1 uppercase, 1 lowercase, 1 number and 1 special character."
            }
        });
        return;
    }

    //Fetch user with specified email Id
    User.findOne({email : request.body.email}).exec(function(findError, user){
        
        //Checking for error
        if(findError){
            response.status(500).json({
                success : false,
                error : findError
            });
            return;
        }

        //console.log('USER =>', user);
        
        //Checking if user with specified email was found
        if(user == null){
            //Could not find user with specified email id
            response.status(401).json({
                success : false,
                error : {
                    message : "Incorrect email or password!"
                }
            });
            return;
        }

        //User was found
        //Check if currentPassword is same as hashed password from DB
        bcrypt.compare(currentPassword, user.password).then(function(didMatch){
            if(didMatch){
                //match
                //console.log('PASSWORD DID MATCH');
                bcrypt.hash(newPassword, 10, function(hashError, hash){
                    
                    //Could not hash the password due to some reason.
                    if(hashError){
                        response.status(500).json({
                            success : false,
                            error : hashError
                        });
                        return;
                    }

                    user.password = hash;
                    user.save().then(function(result){
                        //console.log("PASSWORD UPDATED -> ", result);
            
                        response.status(201).json({
                            success : true,
                            data : {
                                message : "Password updated successfully!"
                            } 
                        });
                    }).catch(function(updateError){
                        //console.log("ERROR CREATING NEW USER -> ", updateError);
                        response.status(500).json({
                            success : false,
                            error : updateError
                        });
                    });

                });             
            }else{
                //no match
                //console.log('PASSWORD DID NOT MATCH');
                response.status(401).json({
                    success : false,
                    error : {
                        message : "Incorrect email or password!"
                    }
                });
                return;
            }
        });
    });
    
}


const userLogin = function(request, response){

    if(request.body.email === "" || request.body.password === ""){
        //atleast 1 param is missing.
        response.status(406).json({
            success : false,
            error : {
                message : "Please enter all the mandatory fields!"
            }
        });
        return;
    }

     //Fetch user with specified email Id
     User.findOne({email : request.body.email})
     .exec() 
     .then(function(user){
         //console.log("USER LOGIN ", user);
         //Checking if user with specified email was found
         if(user == null){
            //Could not find user with specified email id
            response.status(401).json({
                success : false,
                error : {
                    message : "Incorrect email or password!"
                }
            });
            return;
        }

        bcrypt.compare(request.body.password, user.password, function(error, didMatch){

            //Checking for error
            if(error){
                //console.log("ERROR123", error);
                response.status(401).json({
                    success : false,
                    error : {
                        message : "Incorrect email or password!"
                    }
                });
                return;
            }

        
            if(didMatch){
                //Login Successful!

                //Creating Auth Token which will be used in subsequent requests by client
                const jwtToken = jwt.sign(
                    {
                        id : user._id,
                        email : user.email
                    }, 
                    process.env.JWT_SECRET,
                    {
                        expiresIn : '1h'
                    }
                );
                
                response.status(200).json({
                    success : true,
                    data : {
                        email : request.body.email,
                        token : jwtToken
                    }
                });

            }else{
                //Login Failed!
                response.status(401).json({
                    success : false,
                    error : {
                        message : "Incorrect email or password!"
                    }
                });
            }

        });



     }).catch(function(error){
         //console.log("ERR", error);
        response.status(500).json({
            success : false,
            error : error
        });
        return;
     });


}



const getUserDetails = function(req, res){
    User.findOne({ email: req.body.email }, function (err, doc) {
        if(err){
            //console.log(err);
            res.status(500).json({
                success : false,
                error : err
            });
            return;
        }

        res.status(200).json({
            success : true,
            data :  doc
        });

    });

}

module.exports.handleUserRegistrationProcess = handleUserRegistrationProcess;
module.exports.updatePassword = updatePassword;
module.exports.getUserDetails = getUserDetails;
module.exports.userLogin = userLogin;

