const User = require('../models/userModel')

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
        console.log('in the getall');
        res.status(201)
           .json({
            status: 'success',
            data: {
                results: users.length,
                users
            }
           }) 
    }catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}