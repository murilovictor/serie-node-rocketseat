const mongoose = require('./../database'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true
    },
    password:{
        type:String,
        required:true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

//Export the model

module.exports = mongoose.model('User', userSchema);