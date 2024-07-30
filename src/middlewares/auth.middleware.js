import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const verifyJWT = asynchandler( async (req, res, next ) => {
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer", " , ")
        
        if(!token){
            throw new ApiError( 401, "Unauthorized request")
        }
        
        const decodedToken = jwt.verify( token , process.env.ACCESS_TOKEN_SECRET)
    
        await User.findById(decodedToken._id).select(" -refreshToken -password")
    
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user
        next()
    } catch (error) {
          throw new ApiError(401, error?.message || "Invalid access token")

        
        
    }
}) 