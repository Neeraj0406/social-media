const express = require("express")
const { createComment, getAllComment, deleteComment, updateComment } = require("../../controllers/comments/commentCtrl")
const isLogin = require("../../middlewares/isLogin")
const commentRouter = express.Router()


commentRouter.post("/create", isLogin, createComment)
commentRouter.post("/update", isLogin, updateComment)
commentRouter.post("/delete", isLogin, deleteComment)
commentRouter.get("/getall", isLogin, getAllComment)


module.exports = commentRouter