const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

const router = express.Router()

router.route('/signIn')
      .post(authController.signIn)

router.route('/login')
      .post(authController.login)

router 
      .route('/getAll')
      .get(userController.getAllUsers)  
      
router      
      .route('/forgotPassword')
      .post(authController.forgotPassword)

router      
      .route('/resetPassword/:token')
      .patch(authController.resetPassword)


module.exports = router