const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req, res, next) => {
  try{
    const {authorization} = req.headers;
    if(!authorization){
      return res.status(403).json({error: 'Unauthorized'});
    }
    const verify = jwt.verify(authorization.slice(7, authorization.length), process.env.JWT_SECRET);
    if(!verify){
      return res.status(403).json({error: 'Unauthorized'});
    }
    req.user = verify;
    next();
  }catch(err){
    return res.status(500).json({error: 'Unauthorized'}); 
  }
}