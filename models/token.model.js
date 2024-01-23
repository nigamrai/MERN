import {model,Schema} from "mongoose";
const refreshSchema=new Schema({
    name:{type:String},
    token:{type:String,unique:true}
},{timestamps:true});

const refreshTokens=model("RefreshToken",refreshSchema,'refreshTokens');
export default refreshTokens;