const bcrypt = require("bcryptjs")
const User = require("../../model/User/User")
const generateToken = require("../../utils/generateToken")
const getTokenFromHeader = require("../../utils/getTokenFromHeader")
const appError = require("../../utils/appError")
const Post = require("../../model/Post/Post")
const Category = require("../../model/Category/Category")
const Comment = require("../../model/Comment/Comment")


//register
const userRegisterCtrl = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body
        const userEmailFound = await User.findOne({ email: email })
        if (userEmailFound) {
            return res.json({
                msg: "User Already Exist"
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({ firstName, lastName, email, password: hashedPassword })
        res.json({
            status: 200,
            data: user
        })

    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


//login
const userLoginCtrl = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        const userEmailFound = await User.findOne({ email: email })
        if (!userEmailFound) {
            return next(appError("User Not Found", 400))
        }
        const passwordMatch = await bcrypt.compare(password, userEmailFound.password)
        if (!passwordMatch) {
            return res.json({
                msg: "Wrong credentials"
            })
        }
        res.json({
            status: 200,
            data: { user: userEmailFound, token: generateToken(userEmailFound?._id) },
            msg: "user logged in"
        })



    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}

//get user profile
const userProfileCtrl = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user })
        if (!user) {
            return res.json({ msg: "user not found " }).status(400)
        }

        res.json({ data: user }).status(400)
    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}



//udpate Password 
const updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user)

        const { password, previousPassword } = req.body
        let salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const isPasswordMatch = await bcrypt.compare(previousPassword, user.password)
        if (isPasswordMatch) {
            const updatedUser = await User.findByIdAndUpdate(req.user, {
                $set: { password: hashedPassword }
            }, { new: true })

            await updatedUser.save()
            res.json({ status: "Success", data: updatedUser })
        } else {
            return next(appError("Old password does not match", 400))
        }
    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}

// profile photo upload     
const profilePhotoUploadCtrl = async (req, res) => {
    console.log(req.file)
    try {
        const userToUpdate = await User.findById(req.user)
        if (!userToUpdate) {
            return next(appError("User not found", 403))
        }

        if (userToUpdate.isBlocked) {
            return next(appError("Actifon not allowed, your account is blocked", 403))
        }

        if (req.file) {
            await User.findByIdAndUpdate(req.user, { $set: { profilePhoto: req.file.path } }, { new: true })
            res.json({ data: "You have successfully updated your profile", status: "Success" }).status(200)
        }


    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}



// person who view my profile
const viewUserProfile = async (req, res, next) => {
    try {
        console.log("inside view user profile")
        const user = await User.findById(req.params.id)
        const userWhoViewed = await User.findById(req.user)
        console.log("user", user)
        console.log("userWhoViewed", userWhoViewed)
        if (user && userWhoViewed) {
            const isUserAlreadyViewd = User.viewers?.find((viewer) => viewer.toString() == userWhoViewed?._id?.toString())

            if (isUserAlreadyViewd) {
                return next(appError("User already viewed this profile", 200))
            }
            else {
                user.viewers.push(userWhoViewed._id)
                await user.save()
                res.json({ status: "success", msg: "You have viewed this profile" }).status(200)
            }
        } else {
            return next(appError("user not found", 400))
        }
    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


//following
const followingCtrl = async (req, res, next) => {
    try {
        const userToFollow = await User.findById(req.params.id)
        const userWhoFollow = await User.findById(req.user)

        if (userToFollow && userWhoFollow) {
            const isUserAlreadyFollowed = userToFollow?.followers?.find((followUser) => followUser?._id?.toString() == userWhoFollow?._id?.toString())

            if (isUserAlreadyFollowed) {
                return next(appError("You have already followed this user", 400))
            } else {
                userToFollow.followers.push(userWhoFollow?._id)
                userWhoFollow.following.push(req.params.id)

                await userToFollow.save()
                await userWhoFollow.save()
                res.json({ status: "success", msg: "You have successfully follow this user" })
            }
        }
        else {
            return next(appError("user not found", 400))
        }

    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


// unfollow user
const unfollowCtrl = async (req, res, next) => {
    try {
        let unfollowUser = await User.findById(req.params.id)
        let userWhoIsUnfollowing = await User.findById(req.user)

        if (unfollowUser && userWhoIsUnfollowing) {
            const isPresent = unfollowUser.followers.find((followUser) => followUser?._id?.toString() == req.user?.toString())


            if (isPresent) {
                unfollowUser.followers = unfollowUser.followers?.filter((followUser) => followUser?._id?.toString() != req.user?.toString())


                userWhoIsUnfollowing.following = userWhoIsUnfollowing?.following?.filter((followingUser) => followingUser?._id?.toString() != req.params.id?.toString())




                await unfollowUser.save();
                await userWhoIsUnfollowing.save();


                return res.json({ status: "success", msg: "User unfollowed successfully" })


            } else {
                return next(appError("User has already unfollowed", 400))
            }
        }
        else {
            return next(appError("user not found", 400))
        }

    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


//block user
const blockUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.user)
        let blockUser = await User.findById(req.params.id)

        if (user && blockUser) {
            const isUserAlreadyBlocked = user.blocked?.find((blockedUser) => blockedUser?._id?.toString() == req.params.id?.toString())

            if (isUserAlreadyBlocked) {
                return next(appError("User has already blocked", 400))
            } else {
                user.blocked.push(blockUser?._id)
                user.save()
                return res.json({
                    status: "Success",
                    msg: "User blocked successfully"
                })
            }
        } else {
            return next(appError("User not found", 400))
        }
    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


//unblock user
const unBlockUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.user)
        let blockedUser = await User.findById(req.params.id)

        if (user && blockedUser) {
            const isUserAlreadyUnBlocked = user.blocked?.find((blockUser) => blockUser?._id?.toString() == req.params.id?.toString())
            console.log("isUserAlreadyUnBlocked", isUserAlreadyUnBlocked)
            if (!isUserAlreadyUnBlocked) {
                return next(appError("User has already unblocked", 400))
            } else {
                user.blocked = user.blocked.filter(blockedUser => blockedUser?._id?.toString() != req.params.id?.toString())
                user.save()
                return res.json({
                    status: "Success",
                    msg: "User unblocked successfully"
                })
            }
        } else {
            return next(appError("User not found", 400))
        }
    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


// admin -block and unblock
const adminBlockUser = async (req, res, next) => {
    try {
        const adminBlockedUser = await User.findById(req.user)
        if (!adminBlockUser) {
            return next(appError("User not found", 400))
        }

        if (req.body.status == "1") {
            adminBlockedUser.isBlocked = true
            adminBlockedUser.save()
            return res.json({
                status: "Success",
                msg: "User blocked successfully",
                data: adminBlockedUser
            })
        } else if (req.body.status == "-1") {
            adminBlockedUser.isBlocked = false
            adminBlockedUser.save()
            return res.json({
                status: "Success",
                msg: "User unblocked successfully",
                data: adminBlockedUser
            })
        }


    } catch (error) {
        console.log(error);
        next(appError(error.message))
    }
}


const getAllUser = async (req, res) => {
    try {
        const users = await User.find()
        res.json({ data: users })
    } catch (error) {
        next(appError(error.message))
    }
}



// delete account
const deleteAccount = async (req, res, next) => {
    try {
        const userForDelete = await User.findById(req.user)

        await Post.deleteMany({ user: userForDelete?._id })
        await Category.deleteMany({ user: userForDelete?._id })
        await Comment.deleteMany({ user: userForDelete?._id })


        //delete comment
        // delete category 

        //delete user 
        await userForDelete.deleteOne()
        res.json({ status: "success", msg: "Account has been deleted successfully" })


    } catch (error) {
        next(appError(error.message))
    }
}

module.exports = { userRegisterCtrl, userLoginCtrl, userProfileCtrl, profilePhotoUploadCtrl, viewUserProfile, followingCtrl, unfollowCtrl, blockUser, unBlockUser, adminBlockUser, getAllUser, updatePassword, deleteAccount }