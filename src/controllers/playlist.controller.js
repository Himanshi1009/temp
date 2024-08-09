import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import { Video } from "../models/video.models.js"


const createPlaylist = asynchandler(async (req, res) => {
    //TODO: create playlist

    const {name, description} = req.body

    if([name, description].some((fields) => fields?.trim()==="")){
        throw new ApiError(201, "All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(201 , "Playlist not created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(301, "Invalid Playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(201, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(301, playlist,"Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.Types.ObjectId(playlistId)){
        throw new ApiError(201, "Invalid playlist ID")
    }

    if(!mongoose.Types.ObjectId(videoId)){
        throw new ApiError(201, "Invalid Video ID")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(201, "Error in finding the video")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(201, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized user")
    }

    const addedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $push : { video: videoId}
        },
        {
            new: true
        }
    )

    if(!addedPlaylist){
        throw new ApiError(201, "Error in adding the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, addedPlaylist, "Video added successfully")
    )



})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!mongoose.Types.ObjectId(playlistId)){
        throw new ApiError(201, "Invalid playlist ID")
    }

    if(!mongoose.Types.ObjectId(videoId)){
        throw new ApiError(201, "Invalid Video ID")
    }
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(201, "No playlist found")
    }

    const video = await Video.findById(videoId)

    if(!video){
            throw new ApiError(201, " no video found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"Unauthorized user")
    }

    const deletedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull : {video : videoId}
        },
        {
            new : true
        }
    )

    if(!deletedPlaylist){
        throw new ApiError(201, "Error in deleting the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, deletedPlaylist, "Video deleted succssfully")
    )

})

const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist)

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(201, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)   

    if(!playlist){
        throw new ApiError(201, "No playlist found")
    }

    const deleted = await Playlist.findByIdAndDelete(playlistId)

    if(!deleted){
        throw new ApiError(201, "Error! Playlist not deleted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(301,playlist, "Playlist deleted successfully")
    )
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(201, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(201, "invalid playlist id")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(201,"Error while updating")
    }

    return res
    .status(201)
    .json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"))

    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
