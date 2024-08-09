import { Mongoose } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthcheck = asynchandler( async (req,res)=> {

    return res
    .status(200)
    .json(
        new ApiResponse(200, "OK")
    )
})

export { healthcheck}