import mongoose, { Mongoose } from "mongoose";
import { User } from "../models/user.models.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getVideoById = asynchandler(async (req,res ) => {

    const {videoId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(201, "Invalid video Id")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(201, "Error in fetching the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asynchandler( async( req, res) => {
    const {videoId} = req.params;
    const {title, description} = req.body

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(201, " Invalid user id ")
    }

    if(!title || !description){
        throw new ApiError(201, "Fields are required")
    }

    const thumbnailLocalPath = req.files?.path

    
    if(!thumbnailLocalPath){
        throw new ApiError(201, "thumbnail not found")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(201, "Error in uploading file")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,{
                    $set:{ title,
                        description,
                        thumbnail: thumbnail.url
        }
    },
    {
        new : true
    }
    )

    if(!updatedVideo){
        throw new ApiError(201, "Error in upating the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, updatedVideo, " video updated successfully")
    )
})

const deleteVideo = asynchandler( async ( req,res) => {

    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(201, "Invalid video id")
    }

    const video = Video.findById(videoId)

    if(!video){
        throw new ApiError(201, "Video not found")
    }

    if( video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(201, "Only owners can delete")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new ApiError(201, "Error in deleting the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedVideo, "Video deleted successfully")
    )
    

})

const publishVideo = asynchandler( async (req,res) => {

    const { title, description} = req.body

    if(
        [title,description].some((field) => field?.trim() === "")){
            throw new ApiError(201, "Fields are equired")
        }

    const videoLocalPath = req?.files.video[0]?.path
    const thumbnailLocalPath = req?.files.video[0]?.path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(201 , " Fields are compulsory")
    }

    const videoPath = await uploadOnCloudinary(videoLocalPath)
    const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoPath || !thumbnailPath){
        throw new ApiError(201, " Error uploading")
    }

    const video = await Video.create({
        title,
        description,
        thumbnail: thumbnailPath.url,
        videoFile : videoPath.url,
        owner : user._id,
        duration : videoFile.duration
    }
)

if(!video){
    throw new ApiError(300, "Error! Video not uploaded ")
}

return res
.status(200)
.json( new ApiResponse(301, video, "Video uploaded successfully"))

})

const togglePublishStatus = asynchandler( async ( req,res) => {
    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(201, "Invalid video id")
    }

    const video = Video.findById(videoId)

    if(!video){
        throw new ApiError(201, "Video not found")
    }

    if( video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(201, "Only owners can delete")
    }

    const toggledStatus = await video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished : !video.isPublished
            }
        },
        {
            new : true
        }
    )
    
    if(!toggledStatus){
        throw new ApiError(201 ," error in toggling the status")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, toggledStatus, " Toggling of status successfull")
    )

})


export{
    getVideoById, updateVideo, deleteVideo, publishVideo, togglePublishStatus
}