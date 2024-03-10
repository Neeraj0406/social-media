const mongoose = require("mongoose");
const Post = require("../Post/Post");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'last Name is required'],
    },
    profilePhoto: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },

    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['Admin', 'Guest', 'Editor']
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    blocked: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
    userAward: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold'],
        default: "Bronze"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
})

// we can also use regex /^find/ for all find query
userSchema.pre('findOne', async function (next) {
    this.populate("posts")

    const userId = this._conditions?._id
    console.log("userId", userId);
    if (userId) {
        const posts = await Post.find({ user: userId })

        //getting the last post the user has created 
        const lastPost = posts[posts?.length - 1]
        const lastPostDate = new Date(lastPost?.createdAt)

        userSchema.virtual("lastPostDate").get(function () {
            return lastPostDate?.toDateString()
        })


        // check user is inActive
        const currentDate = new Date()
        const diff = currentDate - lastPostDate

        const diffInDays = diff / (1000 * 3600 * 24)
        if (diffInDays > 30) {
            userSchema.virtual("isInActive").get(function () {
                return true
            })

            const user = await User.findByIdAndUpdate(userId, {
                $set: { isBlocked: true }
            }, { new: true })

            await user.save()
        } else {
            userSchema.virtual("isInActive").get(function () {
                return false
            })
        }


        const daysAgo = Math.floor(diffInDays)
        userSchema.virtual("lastActive").get(function () {
            if (daysAgo == 0) {
                return 'Today'
            } else if (daysAgo == 1) {
                return 'Yesterday'
            }
            else if (daysAgo > 1) {
                return `${daysAgo} days ago`
            }
        })



        // update userAward based on the number of post
        const numberOfPosts = posts?.length

        let award = ""

        if (numberOfPosts > 20) {
            award = "Gold"
        } else if (numberOfPosts > 10) {
            award = "Silver"
        } else {
            award = "Bronze"
        }
        const awardedUser = await User.findByIdAndUpdate(userId, {
            $set: { userAward: award }
        }, { new: true })
        if (awardedUser) {
            await awardedUser.save()
        }
    }


    next()
})








userSchema.virtual('fullname').get(function () {
    return `${this.firstName} ${this.lastName}`
})


userSchema.virtual("postCount").get(function () {
    return this.posts.length
})

userSchema.virtual("followerCount").get(function () {
    return this.followers.length
})

userSchema.virtual("followingCount").get(function () {
    return this.following.length
})

userSchema.virtual("viewerCount").get(function () {
    return this.viewers.length
})

userSchema.virtual("blockCount").get(function () {
    return this.blocked.length
})


const User = mongoose.model("User", userSchema)

module.exports = User


