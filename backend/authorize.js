

const authorise = (roleArray) => {
    return (req, res, next) => {
        let userRole = req.body.role

        if (roleArray.includes(userRole)) {
            next()
        }
        else {
            res.send("Not authorised")
        }
    }
}


module.exports = {
    authorise
}