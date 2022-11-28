const User = require('../models/userModel')
const AppError = require('../util/appError')
const sendEmail = require('../util/email')
const crypto = require('crypto')

const jwt = require('jsonwebtoken')
const SignToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES})

}



exports.signIn = async (req, res) => {
    try {
        const newUser = await User.create(req.body) 
        
        const token = SignToken(newUser._id)
        res.status(201)
           .json({
            status: 'success',
            token,
            data: {
                user: newUser
            } 
            
        }) 

    }catch (err){
        
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}


exports.login = async(req, res, next) => {
    
        const {email, password} = req.body

//checking if email and password exists
        if(!email || !password){
            return next(new AppError('Provide email and password', 400))
        } 

//checking if the user exists and password is correct
    try {   
        const user = await User.findOne({email}).select('+password')
        console.log('before if');
        if(!user || !(await user.correctPassword(password, user.password))){
            console.log('inside if');
            return next(new AppError('Incorrect email or password', 401))
        }
        console.log('outside if');
//when everything is ok send the response to the client
        const token = SignToken(user._id)

        res.status(200)
            .json({
            status: 'success',
            token
            })
        } catch(err) {
            next(err)
        }


}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({email: req.body.email})
    try{
        // Get user Based posted email
        

        if(!user){
            return next(new AppError('There is no user with this email address', 404))
        }

        //Generate a random reset token
        const resetToken = user.createPasswordResetToken()
        await user.save({ validateBeforeSave: false })
    

    //Send the token via Email 
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `forgot your password? Send a new PATCH request to ${resetURL}`
    

    await sendEmail({
        email: user.email,
        subject: 'token validity: 10 min',
        message
    })

    res.status(200)
       .json({
        status: 'success',
        message: 'Token sent to email'
       }) 
} catch(err) {
    user.PasswordResetToken = undefined
    user.PasswordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(new AppError('There was a problem with the email, try it out later', 500))
    
}
   
    
} 

exports.resetPassword = async (req, res, next) => {
    //GET user based on token
    try{
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

        const user = await User.findOne({PasswordResetToken: hashedToken, PasswordResetExpires: {$gt: Date.now()}})
    
    //User exist and password validility exists

        if(!user) {
            return next(new AppError('Token is expired or invalid', 400))
        }

        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        user.PasswordResetExpires = undefined
        user.PasswordResetToken = undefined

        await user.save()

        
    //update PasswordChangedAt property

    //Log in the user send JWT

    const token = SignToken(user._id)
        
        res.status(200)
            .json({
            status: 'success',
            token
            })
    } catch(err){
        next(err)
    }
}