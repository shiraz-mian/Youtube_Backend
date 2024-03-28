import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { uploadVideo } from "../controllers/video.controller.js";
import { getVideoById } from "../controllers/video.controller.js";
const router = Router()
router.use(verifyJWT)
router.route('/video').post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    uploadVideo
)

router.route('/id/:videoId').get(getVideoById)
export default router