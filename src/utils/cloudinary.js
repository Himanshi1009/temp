import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary with environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localfilepath) => {
    // Check if the local file path is provided
    if (!localfilepath) return null;

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
        });

        // Log the uploaded file URL
        console.log("File has been uploaded to Cloudinary:", response.secure_url);
        return response;
    } catch (error) {
        // Check if the file exists before attempting to delete it
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        // Log the error
        console.log("Error uploading to Cloudinary:", error);
        return null;
    }
};

// Export the upload function
export { uploadOnCloudinary };
