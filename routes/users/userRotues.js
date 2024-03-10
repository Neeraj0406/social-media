const express = require("express")
const { userRegisterCtrl, userLoginCtrl, userProfileCtrl, profilePhotoUploadCtrl, viewUserProfile, followingCtrl, unfollowCtrl, blockUser, unBlockUser, adminBlockUser, getAllUser, updatePassword, deleteAccount } = require("../../controllers/users/userCtrl")
const isLogin = require("../../middlewares/isLogin")
const storage = require("../../config/cloudinary")
const multer = require("multer")
const isAdmin = require("../../middlewares/isAdmin")


//instance of multer 
const upload = multer({ storage })

const userRouter = express.Router()

//register
userRouter.post("/register", userRegisterCtrl)

//login
userRouter.post("/login", userLoginCtrl)


//user Profile
userRouter.get("/profile", isLogin, userProfileCtrl)

//upload profile photo
userRouter.post("/profile-photo-upload", isLogin, upload.single("profile"), profilePhotoUploadCtrl)

//person view your profile photo
userRouter.get("/profile/viewer/:id", isLogin, viewUserProfile)

//following
userRouter.get("/following/:id", isLogin, followingCtrl)

//unfollow user
userRouter.get("/unfollow/:id", isLogin, unfollowCtrl)

// block user
userRouter.get("/blockUser/:id", isLogin, blockUser)

//unblock user
userRouter.get("/unBlockUser/:id", isLogin, unBlockUser)


//admin block user
userRouter.post("/admin/block", isAdmin, adminBlockUser)


//get all user
userRouter.get("/getAllUser", isLogin, getAllUser)


//update Password 
userRouter.post("/updatePassword", isLogin, updatePassword)


//delete account
userRouter.delete("/delete-account", isLogin, deleteAccount)

module.exports = userRouter