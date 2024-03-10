const appError = require("../utils/appError")
const getTokenFromHeader = require("../utils/getTokenFromHeader")
const verifyToken = require("../utils/verifyToken")

const isLogin = (req, res, next) => {
    const token = getTokenFromHeader(req)
    const decodedUser = verifyToken(token)
    req.user = decodedUser?.id
    if (!decodedUser) {
        // return res.json({ msg: "No Token Attached" }).status(401)
        return next(appError("No Token Attached", 401))
    }
    else {
        next()
    }
}

module.exports = isLogin