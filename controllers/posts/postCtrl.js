const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const appError = require("../../utils/appError");

//create post
const createPostCtrl = async (req, res, next) => {
    try {

        const { title, description, category, } = req.body;
        const author = await User.findOne({ _id: req.user })
        console.log(req.file)
        if (author?.isBlocked) {
            return next(appError("Access denied, account blocked ", 403))
        }
        if (author) {

            const postCreate = await Post.create({
                title, description, user: req.user, category, photo: req.file.path
            })

            author.posts.push(postCreate)
            await author.save()

            res.json({
                status: "success",
                data: postCreate
            })
        } else {
            return next(appError("user not found", 400))
        }
    } catch (error) {
        console.log(error)
        next(appError(error.message))
    }

}


//fetch all post (except whom i blocked and those who blocked me )
const fetchAllPost = async (req, res, next) => {
    try {
        const allPost = await Post.find().populate("user")
        console.log(allPost);
        const user = await User.findById(req.user)

        //removing those whom i blocked 
        let filterPost = allPost?.filter((post) => !user?.blocked?.includes(post.user?._id?.toString()))


        //removing those person who blocked me 
        filterPost = filterPost?.filter((post) => !post?.user?.blocked?.includes(req.user))

        res.json({
            data: filterPost,
            status: "success"
        })

    } catch (error) {
        console.log(error)
        next(appError(error.message))
    }
}



//like and dislike post
const likeAndDislikePost = async (req, res, next) => {
    try {
        const { like, postId } = req.body
        let post = await Post.findById(postId)
        if (post) {


            if (like == 1) {
                const alreadyPresent = post?.likes?.includes(req.user)
                const presentInDislike = post?.disLikes?.includes(req.user)
                if (alreadyPresent) {
                    let newLikeArray = post?.likes?.filter((uid) => uid != req.user)
                    post.likes = newLikeArray
                } else {
                    if (presentInDislike) {
                        let newDisLikeArray = post?.disLikes?.filter((uid) => uid != req.user)
                        post.disLikes = newDisLikeArray
                    }
                    post.likes.push(req.user)
                }
            }


            else if (like == -1) {
                const alreadyPresent = post?.disLikes?.includes(req.user)
                const presentInLike = post?.likes?.includes(req.user)
                if (alreadyPresent) {
                    let newDislikeArray = post?.disLikes?.filter((uid) => uid != req.user)
                    post.disLikes = newDislikeArray
                } else {
                    if (presentInLike) {
                        let newLikeArray = post?.likes?.filter((uid) => uid != req.user)
                        post.likes = newLikeArray
                    }
                    post.disLikes.push(req.user)
                }
            }

            await post.save()
            res.json({
                status: "success",
                data: post
            })
        } else {
            return next(appError("Post not found ", 400))
        }
    } catch (error) {
        next(appError(error.message))

    }
}

const deletePost = async (req, res, next) => {
    try {
        console.log(req.params.id);

        const post = await Post.findById(req.params.id)
        console.log(post);
        console.log(post.user, req.user);

        if (post.user == req.user) {
            await Post.findByIdAndDelete(req.params.id)
            res.json({
                status: "success",
                data: post
            })
        } else {
            return next(appError("You are not allowed to delete this post", 400))
        }


    }
    catch (error) {
        next(appError(error.message))

    }
}


//update post
const updatePost = async (req, res, next) => {
    try {
        const { title, description, category } = req.body
        const post = await Post.findById(req.body?._id)

        if (post.user == req.user) {
            let updatedPost = await Post.findByIdAndUpdate(req.body?._id, {
                $set: {
                    title, description, category, photo: req?.file?.path
                }
            }, { new: true })
            res.json({
                status: "success",
                data: updatedPost
            })
        } else {
            return next(appError("You are not allowed to delete this post", 400))
        }


    }
    catch (error) {
        next(appError(error.message))

    }
}


module.exports = { createPostCtrl, fetchAllPost, likeAndDislikePost, deletePost, updatePost }