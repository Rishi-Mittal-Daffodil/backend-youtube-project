import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {

});

const addComment = asyncHandler(async (req, res) => {
    try {
        const videoId =  req.params ; 
        const {content}  =  req.body ; 
        if(!content ||  !videoId) throw new ApiError(400 , "something went wrong while adding comment") ; 
    
        const comment = await Comment.create({
            content : content ,  
            owner :  req.user?._id , 
            videoId :  videoId 
        }) 
    
        if(!comment) throw new ApiError(400 , "something went wrong while adding comment") ; 
        res.status(201).json(new ApiResponse(200 , comment , "comment added successfully"))
    
    } catch (error) {
        console.log("something went wrong while adding comment " , error);
    }
});

const updateComment = asyncHandler(async (req, res) => {
    try {
        const {commentId} =  req.params ; 
        const {content}  =  req.body ; 
        if(!commentId) throw new ApiError(400 , "something went wrong while adding comment") ; 
        const comment = await Comment.findByIdAndUpdate(commentId ,  )
        if(!comment) throw new ApiError(400 , "something went wrong while adding comment") ; 
        res.status(201).json(new ApiResponse(200 , comment , "comment added successfully")) ; 
        
    
    } catch (error) {
        console.log("something went wrong while adding comment " , error);
    }
});

const deleteComment = asyncHandler(async (req, res) => {});

export { getVideoComments, addComment, updateComment, deleteComment };
