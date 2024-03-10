const User = require("../model/User/User")
const appError = require("../utils/appError")
const getTokenFromHeader = require("../utils/getTokenFromHeader")
const verifyToken = require("../utils/verifyToken")


const isAdmin = async (req, res, next) => {
    const token = getTokenFromHeader(req)
    const decodedUser = verifyToken(token)
    req.user = decodedUser?.id

    const user = await User.findById(decodedUser?.id)
    console.log("user",user)
    if (!decodedUser) {
        // return res.json({ msg: "No Token Attached" }).status(401)
        return next(appError("No Token Attached", 401))
    }
    else if (user?.isAdmin == false) {
        return next(appError("Unauthorized", 401))
    }
    else {
        next()
    }
}

module.exports = isAdmin