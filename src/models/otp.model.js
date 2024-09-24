import mongoose, { Types } from "mongoose";

const otpSchema = mongoose.Schema({
    otp:{
        type:String , 
        required :  true ,  
    } , 
    email:{
        type:String  ,  
        required :  true  , 
    }
}, {timestamps :  true });




export const OTP =  mongoose.model('OTP' , otpSchema) ; 
