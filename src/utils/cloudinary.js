import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// import {v2 as cloudinary} from 'cloudinary';
          
// cloudinary.config({ 
//   cloud_name: 'dbhb64zza', 
//   api_key: '136243371351729', 
//   api_secret: 'JYH_g66GXJK4ikp-zbO2wF4o26g' 
// });
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploade successfullly
        // console.log("file is upoload successfully",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
         console.log("file is not uploaded")
         fs.unlinkSync(localFilePath)// remove the locally saved tempory file ass the operation get failde
        return null;
    }
}

export {uploadOnCloudinary}