const express = require("express")
const app = express()
require('dotenv').config()
require("./dbConnect")

const userRouter = require("./routes/users/userRotues")
const postRouter = require("./routes/posts/postRoutes")
const commentRouter = require("./routes/comments/commentRoutes")
const categoriesRouter = require("./routes/categories/categoriesRoutes")
const globalErrorHandler = require("./middlewares/globalErrorHandler")
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 8000


//middlewares 
app.use(express.json()) //pass incoming payload 
app.use(bodyParser.urlencoded({ extended: false }))

const userAuth = {
    isLogin: false,
    isAdmin: false
}

// app.use((req, res, next) => {
//     console.log("inside")
//     next()
// })



// routes

// user routes
app.use("/api/v1/users", userRouter)
//post routes
app.use("/api/v1/posts", postRouter)
//comments
app.use("/api/v1/comments", commentRouter)
//categories
app.use("/api/v1/categories", categoriesRouter)


app.use(globalErrorHandler)


//404 error
app.use("*", (req, res) => {
    res.status(404).json({
        message: "Route not found"
    })
})

// user routes

app.listen(PORT, () => {
    console.log("Connected to server", PORT)
})