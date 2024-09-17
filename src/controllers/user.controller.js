import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
  const {fullname , username , email , password } = req.body();
  if(fullname==="") throw new ApiError(400 , "Please Enter fullname") ; 
  else if(username==="") throw new ApiError(400 , "Please enter username") ; 
  else if(email==="")  throw new ApiError(400 , "Please enter email") ;
  else if(password==="") throw new ApiError(400 , "please enter password") ; 
  const existedUser =  await User.findOne({$or : [{username} , {email}]}) ; 
  if(existedUser) throw new ApiError(409 , "user already exist") ;  

  const avatarLocalPath = req.files?.avatar[0]?.path ; 
  const coverImageLocalPath = req.files?.coverImage[0]?.path ; 
  
  if(!avatarLocalPath) throw new ApiError(400 , "Please Provide a  Avatar")
  const avatar =  await  uploadOnCloudinary(avatarLocalPath) ; 
  const coverImage= await uploadOnCloudinary(coverImageLocalPath) ; 

  if(!avatar) throw new ApiError(400 , "please provide avatar ") ; 

  const user = await User.create({
    fullname  ,
    username : username.toLowerCase() ,
    email  ,
    password , 
    avatar : avatar.url ,
    coverImage : coverImage?.url || "" 
  })
  
  const createdUser =  await  User.findById(user._id) ; 
  if(!createdUser) throw  new ApiError(500 , "Something went wrong while registering the user ");

  res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered Successfully") 
  ) ;

});

export { registerUser };
