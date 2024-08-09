import mongoose, { Mongoose } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";
import { Comment } from "../models/comment.models.js";

const toggleVideoLike = asynchandler( async ( req,res) => {

    const videoId = req.params.videoId

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(201, "Invalid video id ")
    }

    const liked = await Like.findOne({
        video : videoId,
        likedBy: req.user?._id

    })

    if(!liked){
        const newLike = await Like.create({
            video: videoId,
            likedBy: user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200, newLike, "Video liked successfully")
        )
    }
    else{
        const deleteLike = await Like.findByIdAndDelete(like._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200, deleteLike, "video unliked successfully")
        )
    }

})

const toggleTweetLike = asynchandler( async ( req,res) => {
    const {tweetId} = req.params
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(201, "Invalid tweet id")
    }

    const liked = await Tweet.findOne({
        tweet : tweetId,
        likedBy: user.id
    })

    if(!liked){
        const newLike = await Tweet.create({
            tweet: tweetId,
            likedBy: user.id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200, newLike, "Tweet liked successfully")
        )
    }
    else{
        const deleteLike = await Tweet.findByIdAndDelete(tweetId)

        return res
        .status(200)
        .json(
            new ApiResponse(200, deleteLike, "Tweet disliked successfully")
        )
    }
 })

const toggleCommentLike = asynchandler( async ( req,res) => {
    const {commentId} = req.params
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(201, "Invalid comment id")
    }

    const liked = await Comment.findOne({
        comment : commentId,
        likedBy: user.id
    })

    if(!liked){
        const newLike = await Comment.create({
            comment : commentId,
            likedBy: user.id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200, newLike, "Comment liked successfully")
        )
    }
    else{
        const deleteLike = await Comment.findByIdAndDelete(commentId)

        return res
        .status(200)
        .json(
            new ApiResponse(200, deleteLike, "Comment disliked successfully")
        )
    }
 })

const getAllLikedVideos = asynchandler ( async ( req,res)=> {

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(!likedVideos) {
        throw new ApiError(201, "something went wrong while fetching liked videos")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "All liked video fetched successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getAllLikedVideos
}