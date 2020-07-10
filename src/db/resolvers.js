const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
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
        }
    },
    Mutation:{
        newUser:async (_,{input})=>{
            const {email, password} = input;
            // revisar si existe un usuario
            const existUser =  await User.findOne({email});
            console.log(existUser);
            if (existUser) {
               throw new Error('El usuario ya esta registrado'); 
            }
            // hashear password
            const salt =await bcryptjs.getSalt(10);
            input.password= await bcryptjs.hash(password,salt);

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
                token: crearToken(existUser, process.env.WORD_SECRET,'1h')
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
        }
        
    }
}

module.exports= resolvers;