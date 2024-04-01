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
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}