import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

//genrating access and refresh token .
const generateAccessTokenAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  console.log("token",user);
  
  const accessToken =user.generateAccessToken();
  const refreshToken =user.generateRefreshToken();
  user.refreshToken =  refreshToken ; 
  if (!(accessToken || refreshToken))
    throw new ApiError(
      "something went wrong while generating  access and refresh token "
    );
  return { accessToken, refreshToken };
};

//registering user .
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  if (fullname === "") throw new ApiError(400, "Please Enter fullname");
  else if (username === "") throw new ApiError(400, "Please enter username");
  else if (email === "") throw new ApiError(400, "Please enter email");
  else if (password === "") throw new ApiError(400, "please enter password");
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) throw new ApiError(409, "user already exist");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path ;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
    console.log(coverImageLocalPath);
  }

  if (!avatarLocalPath) throw new ApiError(400, "Please Provide a  Avatar");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "please provide avatar ");

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user ");

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email))
    throw new ApiError(400, "Please Provide username or password");

  const user = await  User.findOne({ $or: [{ username }, { email }] });
  console.log(user);
  
  if (!user) throw new ApiError(404, "user not Exist");

  const isPassword = await user.isPasswordCorrect(password);
  if (!isPassword) throw new ApiError(401, "Please Enter Valid Credentials");
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

//logout user  .
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfuly"));
});


const refreshAccessToken = asyncHandler(async (req , res)=>{
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken ; 
    if(!incomingRefreshToken){
      throw new ApiError(401 , "unAuthorized acess") ; 
    }
    const decodeToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    const user =  await  User.findById(decodeToken?._id) ; 
    if(!user)  throw new ApiError(401 , "Invalid refresh token");

    if(incomingRefreshToken !==  user?.refreshToken){
      throw new ApiError(401 , "refresh token is used or expired ") ;
    }

    const options = {
      httpOnly : true ,  
      secure :  true 
    }

    const {accessToken , newRefreshToken} = generateAccessTokenAndRefreshToken(user._id) ; 
    res
    .status(200)
    .cookie("accessToken" , accessToken , options) 
    .cookie("refreshToken" , newRefreshToken , options)
    .json(new ApiResponse(200 , {accessToken  , refreshToken :  newRefreshToken} , "token refreshed")) ; 

  } catch (error) {
    throw new ApiError(401 , error?.message , "invalid User access")
  }

})

export { registerUser, loginUser, logoutUser };    
