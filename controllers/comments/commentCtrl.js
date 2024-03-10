const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appError = require("../../utils/appError");



const createComment = async (req, res, next) => {
    try {
        const { post, description } = req.body

        const postFound = await Post.findById(post)
        const user = await User.findById(req.user)
        if (postFound) {
            const comment = await Comment.create({
                post, description, user: req.user
            })

            user.comment = [...user.comment, comment._id]
            postFound.comment = [...postFound.comment, comment._id]

            await user.save()
            await postFound.save()

            res.json({
                status: "success",
                data: comment
            })
        } else {
            return next(appError("Post not found ", 400))
        }



    } catch (error) {
        console.log(error);

        next(appError(new Error))
    }
}


const updateComment = async (req, res, next) => {
    try {
        const { post, description, commentId } = req.body
        const commentFound = await Comment.findById(commentId)

        if (commentFound) {
            const updatedComment = await Comment.findByIdAndUpdate(commentId, {
                $set: {
                    post, description, user: req.user
                }
            }, {
                new: true
            })

            res.json({
                status: "success",
                data: updatedComment
            })
        } else {
            return next(appError("Post not found ", 400))
        }
    } catch (error) {
        next(appError(new Error))
    }
}


const deleteComment = async (req, res, next) => {
    try {
        const commentFound = await Comment.findById(req.body.commentId)
        const postFound = await Post.findById(req.body.postId)
        const user = await User.findById(req.user)

        if (commentFound && postFound) {
            await Comment.findByIdAndDelete(req.params.id)

            user.comment = user.comment?.filter((com) => com?._id != req.body.commentId)
            postFound.comment = postFound.comment?.filter((com) => com?._id != req.body.commentId)


            await user.save()
            await postFound.save()
            res.json({
                msg: "comment deleted"
            })
        }
    } catch (error) {
        next(appError(new Error))
    }
}

const getAllComment = async (req, res, next) => {
    try {
        const comments = await Comment.find(req.params.id)
        res.json({
            data: comments
        })
    } catch (error) {
        next(appError(new Error))
    }
}


module.exports = { createComment, getAllComment, deleteComment, updateComment }