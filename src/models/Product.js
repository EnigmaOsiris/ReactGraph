const mongoose = require('mongoose');
const ProductsSchema = mongoose.Schema({
    name:{
        type: String,
        require:true,
        trim:true
    },
    exist:{
        type: Number,
        require:true,
        trim:true
    },
    price:{
        type:Number,
        require:true,
        trim:true
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
});
module.exports = mongoose.model('Product',ProductsSchema);