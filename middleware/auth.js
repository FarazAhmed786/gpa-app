const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    const token = req.header('Authorization');
    if(!token) return res.status(401).send({success:false, msg:'Access Denied. No token provided.', code: 401});

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        next();
    }
    catch(ex) {
        console.log('exception:: '+ex);
        res.status(400).send({success:false, msg:'Invalid token.', code: 400});
    }
}