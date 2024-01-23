import {model,Schema} from 'mongoose';
const courseSchema=new Schema({
    title:{
        type:String,
        maxLength:[50,"Title length must be less than 50"],
        minLength:[5,"Title length must be greater than 5"],
        trim:true,
        required:[true,"Title is required"]
    },
    description:{
        type:String,
        required:[true,"Description is required"],
        maxLength:[200,"Description lenght must be less than 200"]
    },
    category:{
        type:String,
        required:[true,"Category is required"]
    },
    thumbnail:{
            public_id:{
                type:String,
                required:true
            },
            secure_url:{
                type:String,
                required:true
            }
    },
    lectures:[{
        title:String,
        description:String,
        lecture:{
            public_id:{
                type:String,
            },
            secure_url:{
                type:String,
            }
        }
    }],
    numberOfLectures:{
        type:Number,
        default:0
    },
    createdBy:{
        type:String,
        required:true
    }

},{timestamps:true});
const Course=model('Course',courseSchema,'courses');
export default Course;