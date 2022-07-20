const router = require('express').Router();
const Users = require('../Models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//create new account for user
router.post('/signup',async (req,res)=>{

    //check if user is exist or not
    let existingUser = await Users.find({email:req.body.email})
    try{
        if(existingUser.length != 0 && existingUser[0].email == req.body.email){
            return res.status(200).json({message : "This email is already in use"})
        }
    }catch(err){
        console.log(err)
    }

    //hash password before save into database
    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    //create new user object
    let newUser = new Users({
        email : req.body.email,
        password : hashedPassword,
    })

    //Create new JWT token 
    let email = req.body.email
    const token = jwt.sign({
        email
    }, process.env.JWT_KEY, {
        expiresIn: 72000000
    })
    

    //post data in database
    let postUser = await newUser.save()
    try{
        res.cookie("token", token, { httpOnly: true });
        res.json({
            status: "success",
            code: 200,
            message: "Welcome to online group chat.",
            results: {
                u_id: postUser._id,
                email : postUser.email
            }
        })
    }catch(err){
        res.status(400).json("error :" + err)
    }
})

module.exports = router;