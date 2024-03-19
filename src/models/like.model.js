import mongoose,{Schema} from "mongoose";

const likesSchema = new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"tweet"
    },
    lickedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },

},{
    timestamps:true
})

export const like = mongoose.model("like",likesSchema)