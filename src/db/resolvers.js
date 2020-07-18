const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Order = require('../models/Pedido');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require( 'dotenv').config()

const crearToken=(user,secret,expiresIn)=>{
    console.log(user);
    const {id, email, name, lastName }=user;
    return jwt.sign({id,email, name}, secret, {expiresIn});
}

// resolver
const resolvers ={
    Query:{
        getUser: async(_,{token})=>{
           const userId= await jwt.verify(token, process.env.WORD_SECRET)
           return userId;
        },
        getProducts:async()=>{
            try {
                const products= await Product.find({});
                return products;
            } catch (error) {
                console.log(error);
                
            }
        },
        getProduct:async(_,{id})=>{
            // revisar si el
            const producto =await Product.findById(id)
            if (!producto) {
                throw new Error("producto no encontrado")
            }
            return producto;
        },
        getAllClients:async ()=>{
            try {
                const clientes= await Client.find({});
                return clientes;
            } catch (error) {
                console.log(error);
                throw new Error(error)
                
            }
        },
        getClientsSeller: async(_,{},ctx)=>{
            try {
                const clientes= await Client.find({seller:ctx.user.id.toString()});
                return clientes;
            } catch (error) {
                console.log(error);
                throw new Error(error)
                
            }
        },
        getClient: async(_,{id},ctx)=>{
            const client= await Client.findById(id);
            if (!client) {
                throw new Error("cliente no encontrado");
            }
            if (client.seller.toString()!=ctx.user.id) {
                throw new Error("error de credenciales")
            }
            return client;
        },
        getAllClients: async ()=>{
            try {
                const orders= await Order.find({});
                return orders;
            } catch (error) {
                console.log(error);
            }
        },
        getOrderbySeller: async(_,{},ctx)=>{
            try {
                const orders= await Order.find({selle: ctx.user.id});
                return orders;
            } catch (error) {
                console.log(error);
                throw new Error(error)
            }
        },
        getOrderbyId: async(_, {id}, ctx)=>{
            try {
                // pedido existe
                const order= await Order.findById(id);
                if (!order) {
                    throw new Error("Pedido no encontrado");
                }
                // solo quien lo creo puede verlo
                if (order.seller.toString()!==ctx.user.id) {
                    throw new Error("no tienes los permisos")
                }
                return order;
            } catch (error) {
                console.log(error);
                throw new Error(error)
            }
        }
    },
    Mutation:{
        newUser:async (_,{input})=>{
            console.log(input);
            
            const {email, password} = input;
            // revisar si existe un usuario
            const existUser =  await User.findOne({email});
            console.log(existUser);
            if (existUser) {
                console.log("falla");
                
               throw new Error('El usuario ya esta registrado'); 
            }
            // hashear password
            const salt =await bcryptjs.getSalt(10);
            input.password= await bcryptjs.hash(password,10);

            try {
                // guardar
                const user= new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error);
                return new Error(error);
            }
        },
        authUser:async (_,{input})=>{
            const {email,password}= input;
            // usuario existe
            const existUser = await User.findOne({email});
            if (!existUser) {
                throw new Error('El usuario no existe'); 
             }
            // revisar si el password es correcto
             const passwordCorret= await bcryptjs.compare(password, existUser.password);
             if (!passwordCorret) {
                throw new Error('password incorrecto');
             }
            // crear el token
            return {
                token: crearToken(existUser, process.env.WORD_SECRET,'24h')
            }

        },
        newProduct:async (_,{input})=>{
            try {
                const product = new Product(input);
                const result = await product.save();
                return result; 
            } catch (error) {
                console.log(error);
                throw new Error(error)
                
            }
        },
        updateProduct: async (_,{id,input})=>{
            // revisar si el
            let producto =await Product.findById(id)
            if (!producto) {
                throw new Error("producto no encontrado")
            }
            producto= await Product.findOneAndUpdate({_id:id}, input,{new:true});
            return producto;
        },
        deleteProduct: async(_,{id})=>{
            let producto =await Product.findById(id)
            if (!producto) {
                throw new Error("producto no encontrado")
            }
            await Product.findOneAndDelete({_id:id});
            return "producto eliminado"
        },
        newClient: async(_,{input},ctx)=>{
            console.log(JSON.stringify(ctx));
            
            // existe
            const {email}=input;
            const cliente = await Client.findOne({email});
            if (cliente) {
                throw new Error("el cliente ya existe")
            }
            const newClient= new Client(input);
            // asignar vendedor
            newClient.seller=ctx.user.id;
            // guardar
            try {
                
                const result= await newClient.save();
                return result;
            } catch (error) {
                console.log(error);
                
                throw new Error(error)
            }
        },
        editClient: async(_,{id, input}, ctx)=>{
            // verificar si existe
            let cliente = await Client.findById(id);
            if (!cliente) {
                throw new Error('Ese cliente no existe')
            }
            // verificar si es el vendedor q 
            if (cliente.seller.toString()!==ctx.user.id) {
                throw new Error('No tienes los permisos')
            }
            cliente = await Client.findOneAndUpdate({_id: id}, input, {new:true});
            return cliente;
        },
        deleteClient: async(_,{id}, ctx)=>{
            // verificar si existe
            let cliente = await Client.findById(id);
            if (!cliente) {
                throw new Error('Ese cliente no existe')
            }
            // verificar si es el vendedor q 
            if (cliente.seller.toString()!==ctx.user.id) {
                throw new Error('No tienes los permisos')
            }
            // eliminar cliente
            await Client.findOneAndDelete({_id: id});
            return "Cliente eliminado"
        },
        newOrder: async(_,{input},ctx)=>{
            const {client}= input;
            // verificar si el cliente existe
            let existClient = await Client.findById(client);
            if(!existClient){
                throw new Error('El cliente no existe')
            }
            // el cliente es del vendedor
            // verificar si es el vendedor q 
            if (existClient.seller.toString()!==ctx.user.id) {
                throw new Error('No tienes los permisos')
            }
            // stock disponible
            console.log(input.order);
            for await (const articulo of input.order){
                console.log(articulo);
                const producto = await Product.findById(id);
                if (articulo.cant>producto) {
                    throw new Error(`el articulo ${producto.name} excede la cantidad disponible`)
                }
                else{
                    // restar
                    producto.exist= producto.exist-articulo.cant;
                    await producto.save();
                }
                
            }
            // crear un nuevo pedido
            const nuevoPedido = new Order(input);
            // asignar vendedor
            nuevoPedido.seller=ctx.user.id;
            // guardar en base de datos
            const result= await nuevoPedido.save()
            return result;
        },
        updateOrder: async(_,{id, input},ctx)=>{
            try {
                const {client} = input;
                // pedido existe
                const existOrder= await Order.findById(id);
                if (!existOrder) {
                    throw new Error("El pedido no existe")
                }
                // si el cliente existe
                const existOrder= await Order.findById(id);
                if (!existOrder) {
                    throw new Error("El pedido no existe")
                }
                // si el cliente pertence al vendedor
                // revisar stock
                // save
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
        }
        
    }
}

module.exports= resolvers;