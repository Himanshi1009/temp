
import connectdb from './db/index.js';
import dotenv from 'dotenv'
import {app} from './app.js';


dotenv.config({
    path: './.env'
}
)


connectdb()
.then( () => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    }) 
})
.catch((error) => {
    console.log(" Mongodb connection failed !!!!!", error)
})


// import express from "express";
// import { registerUser } from "./controllers/user.controller.js";

// const app = express();

// app.post("/register", registerUser);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// const app = express()
// ;( async() => {
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/{DB_NAME}`)
//        app.on("error" , () => {
//         console.log("Error" , error);
//         throw error
//        })
//     }
//     catch(error){
//         console.log("ERROR" , error)
//     }
// } ) ()