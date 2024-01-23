import {model,Schema} from "mongoose";
import crypto from 'crypto';
import { string } from "joi";
const userSchema=new Schema({
    fullName:{
        type:String,required:[true,"Name is required"],minLength:[5,"Name must be at least 5 character"],maxLength:[50,"Name must be less than 50 characters"],lowercase:true
    },
    email:{
        type:String,required:[true,"Email is required"],lowercase:true,trim:true,unique:true,match:[/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,"Please fill in a valid email address"]
    },
    password:{
        type:String,required:[true,"Password is required"],minLength:[8,'Password must be at least 8 characters'],select:false
    },
    avatar:{
        public_id:{type:String},secure_url:{type:String}
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER"
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date,
    subscription:{
        id:String,
        status:String
    }
},{timestamps:true});
userSchema.methods={
    generateResetPasswordToken:async function(){
        const resetToken=crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry=Date.now()+15*60*1000;
        return resetToken;
    }
}
const User=model('User',userSchema,'users');
export default User;