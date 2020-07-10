const mongoose = require("mongoose");
const path = require("path");
const dotenv =require( 'dotenv')
const result = dotenv.config();

const connectDB = async () => {
  
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify:false,
      useCreateIndex:true
    });
    console.log("db conectada");
  } catch (error) {
    console.log(`Error ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
