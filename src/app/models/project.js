const mongoose = require('../../database')
// Erase if already required

// Declare the Schema of the Mongo model
var ProjectSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

//Export the model
module.exports = mongoose.model('Project', ProjectSchema);