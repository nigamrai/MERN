import User from '../models/user.model';
import refreshTokens from '../models/token.model';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import CustomErrorHandler from '../services/customErrorHandler';
import fs from 'fs/promises';
import cloudinary from 'cloudinary';
import jwtServices from '../services/jwtServices';
import {} from 'dotenv/config';
import sendEmail from '../services/sendEmail';
import crypto from 'crypto';
const cookieOptions={
  maxAge:7*24*60*60*1000,
  httpOnly:true,
  secure:true
}

const userController={
   
    async register(req,res,next){
      const registerSchema=Joi.object({
        fullName:Joi.string().min(5).max(50).required(),
        email:Joi.string().email().required(),
        password:Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)).required()
      })
      const {error}=registerSchema.validate(req.body);
      if(error){
        return next(error);
      }
      try{  
        const exist=await User.exists({email:req.body.email});
        if(exist){
            return next(new CustomErrorHandler.alreadyExists('This email already exists'));
        }
      }catch(error){
        return next(error);
      }
      const{fullName,email,password}=req.body;
      const hashedPassword=await bcrypt.hash(password,10);
      const user=await User.create({
        fullName,
        email,
        password:hashedPassword,
        avatar:{
          public_id:email,
          secure_url:'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg'
        }
      });
      let access_token;
      let refresh_token;
      try{
        const result=await user.save();
        access_token=jwtServices.sign({_id:result._id,role:result.role});
        refresh_token=jwtServices.sign({_id:result._id,role:result.role},process.env.REFRESH_SECRET,'1y');
        const name=result.fullName;
        await refreshTokens.create({
          name,
          token:access_token
        })
      }catch(err){
        return next(err)
      }
      console.log("File Details>",JSON.stringify(req.file));
      console.log(req.file.path);
      if(req.file){
        try{
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'FBS',
                width:250,
                height:250,
                gravity:'faces',
                crop:'fill'
            });
            if(result){
                user.avatar.public_id=result.public_id;
                user.avatar.secure_url=result.secure_url;
                //Remove file from server
                 fs.rm(`uploads/${req.file.filename}`)
            }
            
        }catch(error){
          return next(CustomErrorHandler.mediaNotUploaded());
        }
      }
      await user.save();
      user.password=undefined;
      res.cookie('token',access_token,cookieOptions);
      res.status(200).json({
        success:true,
        message:"User registered succesfully",
        user,
        access_token,
        refresh_token
      }
      );
    },
    async login(req,res,next){
      const userSchema=Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/))
      })
      const{error}=userSchema.validate(req.body);
      if(error){
        return next(error);
      }
      
     try{
      const{email,password}=req.body;
     
      const user=await User.findOne({email}).select('+password');
     
      
      if(!user){
        return next(CustomErrorHandler.wrongCredentials());
      }
      const match=await bcrypt.compare(password,user.password);
     
      if(!match){
        return next(CustomErrorHandler.wrongCredentials());
      }
      const access_token=jwtServices.sign({_id:user._id,role:user.role});

      const refresh_token=jwtServices.sign({_id:user._id,role:user.role},process.env.REFRESH_SECRET,"1y");
     
      const name=user.fullName;
      await refreshTokens.create({
        name,
        token:access_token
      })
      res.cookie('token',access_token,cookieOptions);
      res.status(200).json({
        success:"true",
        message:"Successfully logged in",
        access_token,
       user
       })
      
     }catch(err){
      return next(err);
     }
     
    },
    async logout(req,res,next){
      res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true
      })
      res.status(200).json({
        success:true,
        message:'User logged out succesfully'
      })
    },
    async getProfiles(req,res,next){
      try{
        const userId=req.user._id;
        
        const user=await User.findById(userId);
        res.status(200).json({
          success:true,
          message:"User Details",
          user
        })
      }catch(err){
        return next(err);
      }
    },
    async forgotPassword(req,res,next){
      const {email}=req.body;
      const emailSchema=Joi.object({
        email:Joi.string().email().required()
      })
      const{error}=await emailSchema.validate(req.body);
      if(error){
        return next(error);
      }
      const user=await User.findOne({email});
      if(!user){
        return next(CustomErrorHandler.doesNotExist("User does not exist"));
      }
      const resetToken=await user.generateResetPasswordToken();
      console.log(resetToken);
      await user.save();
      const resetPasswordURL=`${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const subject="Reset Password";
      const message=`You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">     Reset Your Password</a>\n If the above link does not work for some reason then copy paste this link in new tabl ${resetPasswordURL}. If you have not requested this, kindly ignore.`
      try{
        await sendEmail(email,subject,message);
        res.status(200).json({
          success:true,
          message:`Reset password has been sent to ${email} succesfully`
        })
      }catch(e){
        return next(e);
      }
    },async resetPassword(req,res,next){
      const{resetToken}=req.params;
      
      const {password}=req.body;
      const forgotPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
      const user=await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()}
      })
      if(!user){
        return next(CustomErrorHandler.doesNotExist("Token does not exist or is invalid"));
      }
      user.password=await bcrypt.hash(password,10);
      user.forgotPasswordToken=undefined;
      user.forgotPasswordExpiry=undefined;
      await user.save();
      res.status(200).json({
        success:true,
        message:"Password changed successfully"
      })
    },
    async changePassword(req,res,next){
      const{oldPassword,newPassword}=req.body;
      const id=req.user._id;
      console.log(id);
      const passwordSchema=Joi.object({
        oldPassword:Joi.string().pattern(new RegExp(`^[a-zA-Z0-9]{3,30}$`)).required(),
        newPassword:Joi.string().pattern(new RegExp(`^[a-zA-Z0-9]{3,30}$`)).required()
      })
      const {error}=passwordSchema.validate(req.body);
      if(error){
        return next(error);
      }
      const user=await User.findOne({_id:id}).select('+password');
      if(!user){
        return next(CustomErrorHandler.doesNotExist("User does not exist"));
      }
      const isPasswordValid=await bcrypt.compare(oldPassword,user.password);
      if(!isPasswordValid){
        return next(CustomErrorHandler.doesNotExist("Old password does not match"));
      }
      user.password=await bcrypt.hash(newPassword,10);
      await user.save();
      res.status(200).json({
        success:true,
        message:"Successfully changed password"
      })

    },
    async updateUser(req,res,next){
      const{fullName}=req.body;
      console.log(fullName);
      const id=req.user._id;
      const user=await User.findById(id);
      console.log(user);
      if(!user){
        return next(CustomErrorHandler.doesNotExist("User does not exist"));
      }
      
        user.fullName=fullName;
      
      await user.save();
      console.log(user.fullName);
      
      if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        try{
          const result=await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'Backend',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
        });
        if(result){
            user.avatar.public_id=result.public_id;
            user.avatar.secure_url=result.secure_url;
            //Remove file from server
             fs.rm(`uploads/${req.file.filename}`)
             await user.save();
        }
          res.status(200).json({
            success:true,
            message:"User succesfully updated"
        })
        }catch(error){
          return next(error);
        }
      }
    }
   
}

export default userController;

