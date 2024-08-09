import mongoose, { Mongoose } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asynchandler ( async ( req, res) => {
    const {content} = req.body
    const user = req.user
    const videoId = req.params.videoId

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(201, "Invalid video id")
    }

    if(!content){
        throw new ApiError(201, "Content is required")
    }

    const comment = await Comment.create({
        video :  videoId,
        content,
        owner: user._id
    }
    )

    if(!comment){
        throw new ApiError(201, "Comment not created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )


} )

const deleteComment = asynchandler ( async (req,res) => {
    const commentId = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(201, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this comment")
   }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(201, "Error in deleting the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, deletedComment, "Comment deleted successfully")
    )
})

const updateComment = asynchandler ( async (req,res) => {
    const commentId = req.params
    const { content } = req.body

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(201, "Invalid comment id")
    }

    if(!content){
        throw new ApiError(201, "Field is empty")
    }

    const comment = await Comment.findById(commentId)

    if(comment.owner.toString() != user._id.toString()){
        throw new ApiError(201 , "Only owners can update")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content

    },
    {
        new: true
    }
    )

    if(!updatedComment){
        throw new ApiError(201, "Error in updting the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "comment updated successfully")
    )




})


export{
    addComment,
    deleteComment,
    updateComment
}