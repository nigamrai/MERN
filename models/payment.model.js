import { Schema,model } from "mongoose";
const paymentSchema=new Schema({
    razorpay_payment_id:{
        type:String,
        required:[true,"Razorpay payment id is required"]
    },
    razorpay_subscription_id:{
        type:String,
        required:[turne,"Subscription id is required"]
    },
    razorpay_signatue:{
        type:String,
        reuqired:[true,"Razorpay signature is required"]
    }
},{timestamps:true})
const Payment=model('Payment',paymentSchema);
export default Payment;