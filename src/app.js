const {ApolloServer, gql} = require('apollo-server');
const typeDefs = require ('./db/schema.graphql');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');
const jwt =require('jsonwebtoken');
require( 'dotenv').config()

//conectar base
connectDB();


// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context:({req})=>{
        // console.log(req.header["authorization"]);
        // console.log("#"+process.env.WORD_SECRET);
        
        const token=req.headers["authorization"];
        // console.log("hola"+token);
        
        if (token) {
            try {
                const user =  jwt.verify(token, process.env.WORD_SECRET)
                // console.log("#"+user);
                
                return{user}
            } catch (error) {
                console.log(error);
                
            }
        }
    }
});


// arrancar el servidor
server.listen().then(({url})=>{
    console.log( process.env.WORD_SECRET);
    
    console.log(`Servidor listen in URL ${url}`);
})