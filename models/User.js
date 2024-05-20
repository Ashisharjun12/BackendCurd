const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://miniproject:mini123@cluster0.sx7icoc.mongodb.net/')

const UserSchema = mongoose.Schema({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    profile:{
        type:String,
        default: "default.png"

    },
    post:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ]

})

module.exports = mongoose.model('User',UserSchema)