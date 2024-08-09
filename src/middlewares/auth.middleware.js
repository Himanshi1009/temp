// import { ApiError } from "../utils/ApiError.js";
// import { asynchandler } from "../utils/asynchandler.js";
// import jwt from "jsonwebtoken";
// import { User } from "../models/user.models.js";

// export const verifyJWT = asynchandler(async (req, res, next) => {
//     try {
//         // Get token from cookies or Authorization header
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

//         if (!token) {
//             throw new ApiError(401, "Unauthorized request");
//         }

//         // Verify token
//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//         // Find user
//         const user = await User.findById(decodedToken?._id).select("-refreshToken -password");

//         if (!user) {
//             throw new ApiError(401, "Invalid access token");
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         // Pass error to next middleware
//         next(new ApiError(401, error?.message || "Invalid access token"));
//     }
// });

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})


