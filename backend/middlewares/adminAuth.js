import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({success: false, message: 'Not Authorized login again'});
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET_KEY); 
    if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({success: false, message: 'Not Authorized login again'});
    }
    next();
  } catch (error) {
    console.log();
    return res.json({success: false, error: error.message});
    
  }

}

export default adminAuth;