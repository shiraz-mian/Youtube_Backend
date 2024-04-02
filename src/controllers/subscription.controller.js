import { asyncHandler } from "../utils/asycHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"invalid channel Id");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber:req.user?._id,
        channel:channelId
    })
    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed?._id)

        return res
               .status(200)
               .json(new ApiResponse(200,{subscribed:false},"successfully unsubscribed"))
    }
    const subscribed = await Subscription.create({
        subscriber:req.user?._id,
        channel:channelId
    })
    return res
           .status(200)
           .json(new ApiResponse(200,subscribed,"successfully Subscribed"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(404,"invalid channel Id");
    }
    

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    console.log(channelId)
    if(!isValidObjectId(channelId)){
        throw new ApiError(404,"invalid channel Id");
    }

    // const channelsubscribed = await Subscription.find({
    //    subscriber: channelId
    // });
    // return res.status(200).json(new ApiResponse(200,channelsubscribed,"list fetched succesfully"))
    const subscribersList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }, 
        {
            $unwind: "$subscribers"
        },
        {
            $replaceRoot: {
                newRoot: "$subscribers"
            }
        }
    ])

    if (!subscribersList?.length) {
        throw new ApiError(404, "Subscribers not found")
    }
    console.log(subscribersList)
    res
    .status(200)
    .json(new ApiResponse(200, {
        channelId: channelId,
        subscribersCount: subscribersList?.length,
        subscribers: subscribersList}, "Subscribers list fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}