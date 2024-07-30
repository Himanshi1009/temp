import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async( userId) => {
    try{
        const user = await User.findById( userId )
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false })

        return { accessToken, refreshToken}

    }
    catch(error){
        throw new ApiError(500, "Somethind went wrong while generating tokens")
    }
}

const registerUser = asynchandler(async (req, res) => {
    const { fullname, email, password, username } = req.body;
    console.log("email:", email);

    // Check if any required fields are missing
    if ([fullname, username, password, email].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User with the same email or username already exists");
    }

    console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asynchandler( async (req, res) => {
    //enter username nd password
    //check 
    const { email, username, password } = req.body
    console.log("Email is : " , email)

    if(!username && !email){
        throw new ApiError(401 , "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username} , {email}]
    })

    if(!user){
        throw new ApiError(404, "User not registered")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(403, "Invalid user credentials")
    }

    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    } 

    return res
    .status(200)
    .cookie("accessToken" , accessToken, options)
    .cookie("refreshToken" , refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )


})

const logoutUser = asynchandler( async ( req,res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )

    const options = {

        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200 , {}, "User logged out")
    )

})

const refreshAccessToken = asynchandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

const changeCurrentPassword = asynchandler( async(req, res) => {

    const { oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password")
    }
    
    user.password = newPassword
    await user.save({ validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {} , "Password changed successfully")
    )
})

const getCurrentUser = asynchandler( async ( req, res) => {
    return res
    .status(200)
    .json( new ApiResponse( 200, req.user , "current user fetched succesfully"
    ))
})

const updateAccountDetails = asynchandler( async (req,res) => {
    const { fullname , email} = req.body

    if(!fullname || !email){
        throw new ApiError(400 , "All fields are required")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
    {
        $set:{
            fullname,
            email: email
        }

    },
    {new: true}
).select(" -password")

return res
.status(400)
.json( new ApiResponse(200, user , "Account details updated successfully" ))
})

const updateUserAvatar = asynchandler( async ( req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(300, "Avatar file is missing")
    }

    //delete old image

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const updatedUser = await user.findByIdAndUpdate(
        req.user?._id,
    {
        $set: {
            avatar: avatar.url
        }

    },
    {new : true}).select(" -password")

    
    return res
    .status(200)
    .json(
        new ApiResponse(200 , updatedUaser, "Avatar update dsuccessfully")
    )
})

const updateUserCoverImage = asynchandler( async ( req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(300, "cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    await user.findByIdAndUpdate(
        req.user?._id,
    {
        $set: {
            coverImage : coverImage.url
        }

    },
    {new : true}).select(" -password")

    return res
    .status(200)
    .json(
        new ApiResponse(200 , user, "Cover image update dsuccessfully")
    )
})

const getUserChannelProfile = asynchandler( async( req,res) => {
    const { username} = req.params

    if(!username?.trim()){
        throw new ApiError(401, " Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match :{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup : {
                from: " subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"

            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"

                },
                channelsSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if: { $in : [ rq.user?._id , " subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                fullname : 1,
                username : 1,
                subscribersCount : 1,
                channelsSubscribedToCount : 1,
                isSubscribed : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(430 , "Channel does not exist")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200 , channel[0] , "User channel found succesfully "))
    
})

const getWatchHistory = asynchandler( async (req,res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from : "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as: " owner",
                            pipeline : [{
                                $project: {
                                     fullname : 1,
                                     username: 1,
                                     avatar : 1 
                                }
                            }]
                        }
                    },
                    {
                        $addFields : {
                            owner:{
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched"))
})


export { registerUser , loginUser ,
    logoutUser, refreshAccessToken,
    changeCurrentPassword, getCurrentUser ,
    updateAccountDetails, updateUserAvatar,
    updateUserCoverImage , getUserChannelProfile,
    getWatchHistory };
