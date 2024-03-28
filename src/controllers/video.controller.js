import { asyncHandler } from "../utils/asycHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { Video } from "../models/video.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async (req,res) =>{
    const {title,description} = req.body;
    if(
        [title,description].some((field)=> field?.trim === "") 
    )
    {
         throw new ApiError(400, "All fields are required");
    }

    const videoLocalpath = await req.files?.videoFile[0].path;
    let thumbnailLocalPath;
    if(req.files && req.files.thumbnail.length>0){
        thumbnailLocalPath = await req.files.thumbnail[0].path;
    }

    if(!videoLocalpath){
        throw new ApiError(400, "video is  required");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is  required");
    }

    const videocloudinary = await uploadOnCloudinary(videoLocalpath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videocloudinary){
        throw new ApiError(400, "video not uploaded");
    }
    if(!thumbnail){
        throw new ApiError(400, "thumbnail not uploades");
    }

   const video = await Video.create({
    videoFile:videocloudinary.url,
    thumbnail:thumbnail.url,
    title,
    description,
    duration: videocloudinary?.duration,
    owner:req.user._id
   })
   const createdVideo = await Video.findById(video._id)
   if(!createdVideo){
    throw new ApiError(500,"Spmething went wrong while uploading a video")
   }

   return res
         .status(200)
         .json(new ApiResponse(200,video,"Video upload successfully"))

})

const getVideoById = asyncHandler(async (req,res) =>{
    const {videoId} = req.params;
    if(!videoId) throw new ApiError(404, "video id is required")

    const video = await Video.findById(videoId);

    if(!video) throw new ApiError(404,"video not found")
    video.views+=1;
    await video.save({validateBeforeSave:false})

    return res
           .status(200)
           .json(new ApiResponse(200,video,"video fetched successfully"))
})

export {
    uploadVideo,
    getVideoById
}