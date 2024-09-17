import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dqgs2g9b1",
  api_key: "514282715965622",
  api_secret: "f0csx8WK2vTzOOtQj1zqKIOVvoM",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("ghjkl", localFilePath);

    if (!localFilePath) return null;
    //upload file on cloudinary .
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(response);

    console.log("file has been upload sucessfully ", response.url);
    // we have to unlink the local file path here also .
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // if file uploading failed so we have to localfilepath .
    console.log(error);

    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };

// const uploadResult = await cloudinary.uploader.upload(
//     "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//     {
//       public_id: "shoes",
//     }
//   )
//   .catch((error) => {
//     console.log(error);
//   });

// console.log(uploadResult);
