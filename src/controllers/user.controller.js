import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

//genrating access and refresh token .
const generateAccessTokenAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
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
  const isOtpSend = await sendOTP(email);
  if (!isOtpSend) throw new ApiError(401, "Error occure while sending otp");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

//email verification
//first create otp-verification function .
// after creating otp user verify that using verify-otp route .
// once otp verify then i create refresh-token and verify token .  



const sendOTP = async (email) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: true,
    upperCase: false,
    specialChars: false,
  });
  try {
    const otpmodel = await OTP.create({ email: email, otp: otp });
    if (!otpmodel)
      throw new ApiError(400, "error occure while creating otp model . ");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rishimittal283110@gmail.com",
        pass: "gbncthgcfnkdwspq",
      },
    });
    const emailres = await transporter.sendMail({
      from: "rishimittal283110@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${otp}`,
    });
    console.log(emailres);
    return true;
  } catch (e) {
    await OTP.findOneAndDelete({ email, otp });
    console.log(e);
    return false;
  }
};

const otpverification = asyncHandler(async (req, res) => {
  const {email ,   otp } = req.body;

  if(!email || !otp)  throw new ApiError(400 , "please enter valid otp Or email ")

  try {
    const user = await User.findOne({ email: email });
    if (!user) throw new ApiError(400, "email id not exist ");
    const otpRecord = await OTP.findOneAndDelete({ email, otp });
    if (!otpRecord) return res.status(400).send("Invalid OTP Resend Otp now ");
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
  } catch (error) {
    console.log(error);
    return false;
  }
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email))
    throw new ApiError(400, "Please Provide username or password");

  const user = await User.findOne({ $or: [{ username }, { email }] });
  console.log(user);

  if (!user) throw new ApiError(404, "user not Exist");

  
  const isPassword = await user.isPasswordCorrect(password);
  if (!isPassword) throw new ApiError(401, "Please Enter Valid Credentials");
  
  const isOtpSend = await sendOTP(email);
  if (!isOtpSend) throw new ApiError(401, "Error occure while sending otp");

  return res
    .status(200)
    .send("password is correct now proceed to otp verification");
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

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfuly"));
});

//refreshing access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unAuthorized access");
    }
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodeToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is used or expired ");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = generateAccessTokenAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "invalid User access");
  }
});

//change password

const changePassword = asyncHandler(async (req, res) => {
  const { currPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) throw new ApiError(401, "User Not Exist");

  const iscorrect = await user.isPasswordCorrect(currPassword);

  if (!iscorrect) throw new ApiError(401, "Password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiError(200, {}, "Password Changed Sucessfully"));
});

//to return the current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user fetched successfully"));
});

//to update account information .
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(401, "provide fullname or email");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update Successfully"));
});

//to update avatar

const updateAvatar = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;
  console.log(req.file);

  if (!localFilePath) throw new ApiError(400, "please upload a avatar");

  const avatar = await uploadOnCloudinary(localFilePath);

  if (!avatar.url)
    throw new ApiError(400, "Error occure while uploading avatar");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Update Successfully"));
});

//to update cover image .
const updateCoverImage = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;
  if (!localFilePath) throw new ApiError(400, "please upload new coverimage");

  const coverImage = await uploadOnCloudinary(localFilePath);

  if (!coverImage.url)
    throw new ApiError(400, "error  occure while uploading cover image");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  otpverification,
};
