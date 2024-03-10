const getTokenFromHeader = (req) => {
    const token = req.headers?.authorization?.split(" ")?.[1]

    if (token) {
        return token
    } else {
        return {
            msg: "No Token Find"
        }
    }
}

module.exports = getTokenFromHeader