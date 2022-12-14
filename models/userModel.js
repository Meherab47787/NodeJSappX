const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please use a name']
    },

    email: {
        type: String,
        required: [true, 'You must provide an e-mail'],
        unique : true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid e-mail']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password for your profile'],
        minlength: 6,
        select: false
    },

    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    },

    PasswordChangedAt: Date,
    PasswordResetToken: String,
    PasswordResetExpires: Date

})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined

    next()

})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next()

    this.PasswordChangedAt = Date.now() - 1000
    next()
})


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}


userSchema.methods.createPasswordResetToken = function() {
    
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.PasswordResetToken = crypto.createHash('sha256')
                                          .update(resetToken)
                                          .digest('hex')
            
    console.log({resetToken}, this.PasswordResetToken);
    
    this.PasswordResetExpires = Date.now() + 10 * 60 * 1000
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User