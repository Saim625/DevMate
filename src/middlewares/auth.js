const adminAuth = (req,res,next)=> {
    const token = "xcv";
    const isAdminAuthorized = token === "xcv";
    if(!isAdminAuthorized){
        res.status(401).send("Unauthorizec Request")
    }else{
        next()
    }
}

const userAuth = (req,res,next)=> {
    const token = "xzc";
    const isUserAuthorized = token === "xzc";
    if(!isUserAuthorized){
        res.status(401).send("Unauthorizec Request")
    }else{
        next()
    }
}

module.exports = {
    adminAuth,
    userAuth
}
