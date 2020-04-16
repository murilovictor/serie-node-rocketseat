const mongoose = require('../../database')
const bcrypt = require('bcryptjs') // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        index:true,
    },
    password:{
        type:String,
        required:true,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },    
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash;
    next();
})

//Export the model
module.exports = mongoose.model('User', userSchema);