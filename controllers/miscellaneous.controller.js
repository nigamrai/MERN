import Joi from "joi";
import sendEmail from "../services/sendEmail";
import {} from 'dotenv/config'
const miscellaneousController={
    async contactUs(req,res,next){
     const {name,email,message}=req.body;
      const contactSchema=Joi.object({
        name:Joi.string().required(),
        email:Joi.string().email().required(),
        message:Joi.string().required()
    })
    const {error}=contactSchema.validate(req.body);
    if(error){
        return next(error);
    }
    let messages;
    try{
        const subject="Contact us Form";
         messages=`${name}-${email}
          ${message}`;
        await sendEmail(process.env.SMTP_FROM_EMAIL,subject,messages)
    }catch(error){
        return next(error);
    }
    res.status(200).json({
        success:true,
        message:"Your requrest has been submitted sucessfully",
        messages
    })

    },
    async getStats(req,res,next){
        try{
            const userCount=await User.countDocuments();
            res.status(200).json({
                success:true,
                message:'All Users count',
                userCount
            })
        }catch(err){
            return next(err);
        }
    }

}
export default miscellaneousController