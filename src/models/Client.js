const mongoose = require('mongoose');
const ClientsSchema = mongoose.Schema({
    name:{
        type: String,
        require:true,
        trim:true
    },
    lastName:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        trim:true,
        unique:true
    },
    company:{
        type:String,
        require:true,
        trim:true
    },
    phone:{
        type:String,
        trim:true
    },
    cretedAt:{
        type:Date,
        default:Date.now()
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    }
})

module.exports = mongoose.model('Client',ClientsSchema)