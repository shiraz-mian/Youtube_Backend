import { asyncHandler } from "../utils/asycHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
const genrateAccessAndRefershToken = async(userId)=>{
    try {
       const user= await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       
       user.refreshToken = refreshToken;
      await user.save({validateBeforeSave:false})
      return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{

     //get user details from frontend
     //validation - not empty
     //check if user already exists:username, email
     //check for images,check for avatar
     //upload them to cloudinary,avatar
     //create user object- create entry in db
     //remove password and refresh token field from response
     //check for user creation 
     //return res
    


    const {fullName,email,username,password} = req.body
   
    if(
        [fullName,email,username,password].some((field) =>field?.trim()=== "")
    ){
        throw new ApiError(400,"All field is required")
    }
     
    // check user is exists in db
    const existedUser =await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User Already Existed")
    }
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    //const coverImageLocalPath=  req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    console.log(req.files)

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(409,"Avatar Already Existed")

    }
    // console.log(coverImage)
    // console.log(avatar)

   
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring user")
    }
   

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req,res) =>{
    // req body -> data
    // username or email base login
    //find the user if user is exists
    //check password
    //access and referesh token
    // send secure cookies

    const {username,email,password} = req.body

    if(!(username || email)){
        throw new ApiError(400,"username or password required")
    }

    const user =await User.findOne({
        $or:[{username},{email}]
    })
    console.log(user)
    if(!user){
        throw new ApiError(404,"User Does not exists")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
        throw new ApiError(401,"Wrong Password")
    }

  const {accessToken,refreshToken}= await genrateAccessAndRefershToken(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
    )

    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200).cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,
                refreshToken
            },
            "User loggedIn successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options = {  
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user Logout successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingrefreshToken =req.cookies.refreshToken||req.body.refreshToken
    
    if(!incomingrefreshToken){
        throw new ApiError(401,'Unauthorized request')
    }

    try {
        const decodedTOken = jwt.verify(
            incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedTOken?._id)
        if(!user){
            throw new ApiError(401,'Invalid refresh token')
        }
    
        if(incomingrefreshToken !==user?.refreshToken){
            throw new ApiError(401,"Resfresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}= await genrateAccessAndRefershToken(user._id)
    
       return res
       .status(200)
       .cookie("accessToke",accessToken,options)
       .cookie('refreshToken',newrefreshToken,options)
       .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "Access token referesh succesfully"
        )
       )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refereshToken")
    }
})
export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

}