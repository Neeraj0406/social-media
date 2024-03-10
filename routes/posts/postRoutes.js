const express = require("express")
const { createPostCtrl, fetchAllPost, likeAndDislikePost, deletePost, updatePost } = require("../../controllers/posts/postCtrl")
const isLogin = require("../../middlewares/isLogin")
const postRouter = express.Router()
const multer = require("multer")
const storage = require("../../config/cloudinary")

const upload = multer({ storage })

postRouter.post("/", isLogin, upload.single('photo'), createPostCtrl)

//get all post (expect the blocked user and those user who blocked login user)
postRouter.get("/getAllPost", isLogin, fetchAllPost)

//likes and dislikes post
postRouter.post("/likeDislike", isLogin, likeAndDislikePost)


//delete post
postRouter.get("/deletePost/:id", isLogin, deletePost)

//update post
postRouter.post("/updatePost", isLogin, upload.single('photo'), updatePost)




module.exports = postRouter