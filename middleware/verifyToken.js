const { verify } = require("jsonwebtoken");

const verifyUser = async(req, res, next) => {
    try{
        const headerToken = req.headers.token;
        if(headerToken){
            const accessToken = headerToken.split(" ")[1];
            const result = await verify(accessToken, process.env.JWT_TOKEN);
            req.user = result;
            next();
        }
        else{
            res.status(400).json({
                status: 400,
                message: "Bad Request: missing headers!!!"
            })
        }
    }
    catch(err){
        console.log(err.message);
    }
}
module.exports = verifyUser;