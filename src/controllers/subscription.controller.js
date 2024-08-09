import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleSubscription = asynchandler( async ( req, res) => {

    const {channelId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const subscribe = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    })

    if(!subscribe){
        const newSubcription = await Subscription.create({
            subscriber: req.user?._id,
            channel : channelId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, newSubcription, "Channel subscribed successfully")
        )
    }

    else{
        const removeSubscription = await Subscription.findByIdAndDelete(subscriptionId)

        return res
        .status(200)
        .json(
            new ApiResponse(200, removeSubscription, "Channel unsubscribed successfully")
        )
    }



})

const getUserChannelSubscribers = asynchandler( async ( req,res) => {

    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(201, "Invalid Channel id")
    }

    const subscribers = await Subscription.find({
        channel : channelId
    })

    if(!subscribers){
        throw new ApiError(201 , " Error in fetching the subscribers")
    }

    return res
    .status(200)
    .json( 
        new ApiResponse(200 , subscribers, " Subscribers fetched successfully")
    )

})

const getSubscribedChannels = asynchandler ( async ( req, res) => {
     
})

export {
    toggleSubscription, 
    getUserChannelSubscribers,
    getSubscribedChannels
}