import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const createTweet = asynchandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    
    if(!content){
        throw new ApiError(400, "No content for tweet")
    }
    const tweet = await Tweet.create({
        content, 
        owner : req.user._id
    })

    if(!tweet){
        throw new ApiError(500, "tweet not created")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, tweet , "Tweet created succesfully"))
})

const getUserTweets = asynchandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, " User id is invalid")
    }

    const tweets = await Tweet.aggregate([
        
    ])


})

const updateTweet = asynchandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(200, " Invalid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(200, " Tweet not found")
    }

    if( tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(300, "unauthorzed request")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!updatedTweet) {
        throw new ApiError(500, "something went wrong while updating tweet.")
    }

    return res
    .status(200)
    .json(200 , tweet , " Tweet updated successfully")
})

const deleteTweet = asynchandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId )){
        throw new ApiError(300, "Invalid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Only owners can delete")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json( new ApiResponse( 300, tweet, "Tweet deleted successfully"))


})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
