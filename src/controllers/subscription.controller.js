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
    if(!isValidObjectId(channelId)){
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

    const subscribed = await Subscription.find({
       subscriber: channelId
    });
  console.log(subscribed)
    return res.status(200).json(new ApiResponse(200,{subscribed},"list fetched succesfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}