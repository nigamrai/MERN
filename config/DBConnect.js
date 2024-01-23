import mongoose from "mongoose";
import {} from 'dotenv/config';
const connectToDB=async()=>{
    try{
        const{connection}=await mongoose.connect(process.env.DB_URL);
        if(connection){
            console.log(`Connected to DB:${connection.host}`);
        }
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}
export default connectToDB;