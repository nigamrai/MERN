import Course from "../models/course.model";
import CustomErrorHandler from "../services/customErrorHandler";
import Joi from 'joi';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
const courseController={
    async createCourse(req,res,next){
        const{title,description,category,createdBy}=req.body;
        const courseSchema=Joi.object({
            title:Joi.string().trim().min(5).max(50).required(),
            description:Joi.string().max(200).required(),
            category:Joi.string().required(),
            createdBy:Joi.string().required()
        });
        const {error}=courseSchema.validate(req.body);
        if(error){
            return next(error);
        }
        let course;
        try{
             course=await Course.create({
                title,
                description,
                category,
                createdBy,
                thumbnail:{
                    public_id:'dummy',
                    secure_url:'dummy'
                }
            })
        }catch(error){
            return next(error);
        }
        if(req.file){
           try{
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:'Backend'
            }) 
            if(!result){
                return next(CustomErrorHandler.mediaNotUploaded());
            }
            course.thumbnail.public_id=result.public_id;
            course.thumbnail.secure_url=result.secure_url;
            fs.rm(`uploads/${req.file.filename}`);
           }catch(error){
            return next(error);
           }
        }
        await course.save();
        res.status(200).json({
            success:true,
            message:"Course added succesfully",
            course
        })   
    },
    async getAllCourses(req,res,next){
        try{
            const courses=await Course.find({});
            res.status(200).json({
                success:true,
                message:"All Courses",
                courses
            })
        }catch(err){
                return next(err);
            }
    },
    async getLecturesByCourseId(req,res,next){
        const{id}=req.params;
        try{
            const course=await Course.findById(id);
            if(!course){
                return next(CustomErrorHandler.doesNotExist("Course not found!!!"));
            }
            res.status(200).json({
                success:true,
                message:"Course Details!!!",
                lectures:course.lectures
            })
        }catch(err){
            return next(err);
        }
    },
    async updateCourse(req,res,next){
        const{id}=req.params;
        try{
            const course=await Course.findByIdAndUpdate(id,{
                $set:req.body
            },{
                runValidators:true
            })
            if(!course){
                return next(CustomErrorHandler.doesNotExist("Course does not exist"));
            }
            res.status(200).json({
                success:true,
                message:"Course updated successfully",
                course
            })
        }catch(error){
            return next(error);
        }
        
    } ,
    async deleteCourse(req,res,next){
        const {id}=req.params;
        try{
            const course=await Course.findByIdAndDelete(id);
            if(!course){
                return next(CustomErrorHandler.doesNotExist("Course does not exist"));
            }
            res.status(200).json({
                success:true,
                message:"Course deleted succesfully",
                course
            })
        }catch(err){
            return next(err);
        }
    },
    async addLectureToCourseById(req,res,next){
      const{id}=req.params;
      const{title,description}=req.body;
      console.log(req.body);
      const lectureSchema=Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required()
      })
      const {error}=lectureSchema.validate(req.body);
      if(error){
        return next(error);
      }
      let lectureData;
      let course;
      try{
         course=await Course.findById(id);
        if(!course){
            return next(CustomErrorHandler.doesNotExist("Course not found"));
        }
         lectureData={
            title,
            description,
            lecture:{}
        }
      }catch(error){
        return next(error);
    }
    if(req.file){
        try{
            const result=await cloudinary.v2.uploader.upload(req.file.path,{
                folder:"Backend",
                chunk_size:500000000,
                resource_type:'video'
            });
            if(result){
                lectureData.lecture.public_id=result.public_id;
                lectureData.lecture.secure_url=result.secure_url;
                fs.rm(`uploads/${req.file.filename}`)
            }
        }catch(error){
            for (const file of await fs.readdir('uploads/')) {
                await fs.unlink(path.join('uploads/', file));
            }
            return next(CustomErrorHandler.mediaNotUploaded());
        }
    }
    course.lectures.push(lectureData);
    course.numberOfLectures=course.lectures.length;
    await course.save();
    res.status(200).json({
        success:true,
        message:"Lecture added succesfully",
        course,

    });
    },
    async removeLectureFromCourse(req,res,next){
        const{courseId,lectureId}=req.query;
        const lectureSchema=Joi.object({
            lectureId:Joi.string().required(),
            courseId:Joi.string().required()
        })
        const {error}=lectureSchema.validate(req.query);
        if(error){
            return next(error);
        }
        const course=await Course.findById(courseId);
        if(!course){
            return next(CustomErrorHandler.doesNotExist("Course does not exist"))
        }
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString()===lectureId.toString()
          );
        if(lectureIndex===-1){
            return next(CustomErrorHandler.doesNotExist("Lecture does not exist"));
        }
        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,{
                resource_type:'video'
            }
        )
        course.lectures.splice(lectureIndex,1);
        course.numberOfLectures=course.lectures.length;
        await course.save();
        res.status(200).json({
            success:true,
            message:'Course Lecture removed succesfully'
        })
    }
}

export default courseController;