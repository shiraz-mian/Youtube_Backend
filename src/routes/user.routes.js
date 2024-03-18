import { Router } from "express";
import { 
     changeCurrentPassword,
     getCurrentuser, 
     getUserChannelProfile, 
     getWatchHistory, 
     loginUser, 
     logoutUser, 
     registerUser, 
     updateAccountDetails, 
     updateUserAvatar, 
     updateUserCoverImage 
    } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:2
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh_token").post(refreshAccessToken)
router.route("/change_password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").post(verifyJWT,getCurrentuser)
router.route("/update_account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover_image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/watchHistory").get(verifyJWT,getWatchHistory)

export default router;