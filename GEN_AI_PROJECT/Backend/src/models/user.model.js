const mongoose = require('mongoose');

const userSchemaa = new mongoose.Schema({
    username:{
        type:String,
        unique: [true, "username already taken"],
        required:true
    },
    email:{
        type:String,
        unique:[true,"Account already created with this email address"],
        required:true
    },
    password:{
        type: String,
        required: true
    }
})

const userModel = mongoose.model("users",userSchemaa);

module.exports = userModel;