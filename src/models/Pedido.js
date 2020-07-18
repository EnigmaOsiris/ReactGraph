const mongoose = require('mongoose');

const PedidosSchema= mongoose.Schema({
    order:{
        type:Array,
        required:true,        
    },
    total:{
        type:Number,
        required:true
    },
    client:{
        type: mongoose.SchemaTypes.ObjectId,
        required:true,
        ref: 'Client'
    },
    seller:{
        type: mongoose.SchemaTypes.ObjectId,
        required:true,
        ref: 'User'
    },
    status:{
        type: String,
        default: "PENDING"
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

module.exports= mongoose.model('Order',PedidosSchema)