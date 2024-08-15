const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async(req, res) => {
    try {
        const {name,email, dob, dept_id, password, role, is_active} = req?.body;
        const userExist = await User.findOne({ email: email });
    
        if (userExist) {
          return res.status(422).json({ error: "User already exist" });
        } else {
          const user = new User({
            name,
            email,
            dob,
            dept_id,
            password,    
            role,
            is_active
          });
          await user.save();
          res.status(201).json({ message: "Signup succesful" });
        }
      } catch (err) {
        console.log(err);
        return res.status(422).json({ error: "Something went wrong" });
      }
}

exports.login = async(req, res) => {
    try{
        const {email, password} = req?.body;
        console.log("email password: ",email, password);
        if(!email || !password){
            return res.status(400).json({error: 'Invalid email or password'});
        }
        const check = await User.findOne({email: email, password: password});
        console.log("check: ",check);
        if(email !== "vikramraimumbai@gmail.com" || password !== "Pass@123"){
            return res.status(401).json({error: 'Unauthorized'});
        }
     
     const token = jwt.sign({id: check?._id, email: check?.email, name: check?.name}, process.env.JWT_SECRET, {expiresIn: '48h'});
  res.json({message: 'Login route', user_info: {id: check?._id, email: check?.email, name: check?.name, role: check?.role}, token: token});
    }catch(err){
        console.log("error",err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}