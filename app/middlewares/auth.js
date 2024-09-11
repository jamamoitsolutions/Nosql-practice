const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const {jwtDecode} = require('jwt-decode');
const fetch = require("../helpers/fetch");

exports.auth = (req, res, next) => {
  try{
    const {authorization} = req.headers;
    // console.log("authorization: ", authorization);
    if(!authorization){
      return res.status(403).json({success: false, message: 'Unauthorized'});
    }
    let verify;
    try{
    verify = jwt.verify(authorization, process.env.JWT_SECRET);
    }catch(err){
    if(!verify){
      verify = jwt.verify(authorization.slice(7, authorization.length), process.env.JWT_SECRET);
    }
  }
    if(!verify){
      return res.status(403).json({success: false, message: 'Unauthorized'});
    }
    req.user = verify;
    next();
  }catch(err){
    console.log("error in auth middleware: ", err);
    return res.status(500).json({success: false, message: 'Unauthorized', error: err}); 
  }
};

exports.verifyMirosoftToken = async (req, res, next) => {
  console.log("verifyMirosoftToken middleware called");
  let token = req.body?.token;
  let email = req.body?.email;
  let password = req.body?.password;
  /////////// start basic authentication

  // if (password && email) {
  //   try {
  //     let user = await User.findOne({
  //       raw: true,
  //       where: {
  //         email: email,
  //       },
  //     });
  //     if (user) {
  //       console.log("user?.myReferalID: ", user?.myReferalID);
  //       if (user?.myReferalID === null) {
  //         console.log("user?.myReferalID is null");
  //         let first3 = user.first_name.substring(0, 3);
  //         console.log("first3: ", first3);
  //         // Function to generate OTP
  //         function generateOTP() {
  //           // Declare a digits variable
  //           // which stores all digits
  //           var digits = "0123456789";
  //           let OTP = "";
  //           for (let i = 0; i < 4; i++) {
  //             OTP += digits[Math.floor(Math.random() * 10)];
  //           }
  //           return first3 + OTP;
  //         }
  //         let referal_id = generateOTP();
  //         console.log("referal_id generated: ", referal_id);
  //       }
  //       console.log("BA: found user: ", user);
  //       if (user?.password == null) {
  //         return res.status(200).send({
  //           accessToken: null,
  //           message: "password not set",
  //         });
  //       }

  //       var passwordIsValid = bcrypt.compareSync(password, user?.password);

  //       if (!passwordIsValid) {
  //         return res.status(202).send({
  //           accessToken: null,
  //           message: "password incorrect",
  //         });
  //       }
  //       req.AD_user_info = user;
  //       next();
  //     } else {
  //       res.status(500).send({
  //         message: "signin failed!",
  //         error: "email/username not found!",
  //       });
  //     }
  //   } catch (error) {
  //     res.status(500).send({ message: "signin failed!", error: error.message });
  //   }
  // }
  /////////// end basic authentication

  ///////// start AD login
  // console.log("token ", token)
  if (!token) {
    return res
      .status(403)
      .send({ success: false, message: "Authorization denied, please login1" });
  }
  try {
    const decoded = jwtDecode(token);
    // const GRAPH_ME_ENDPOINT = "https://graph.microsoft.com/v1.0/me";
    const GRAPH_ME_ENDPOINT = "https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,givenName,jobTitle,mail,mobilePhone,businessPhones,officeLocation,preferredLanguage,surname,userPrincipalName,employeeId,onPremisesSamAccountName,employeeType,department,accountEnabled&accountEnabled eq true";
    //  console.log("decoded : ",decoded, " tenant_id:  ", decoded?.tid);
    const graphResponse = await fetch("get",GRAPH_ME_ENDPOINT, undefined,token);
    //  console.log("graphResponse middware ", graphResponse);
    if (graphResponse?.statusText !== "Unauthorized") {
      // console.log("graphResponse: ", graphResponse?.data);
      let last_name = "",
        user_principal_name = "",
        job_title = "",
        office_location = "",
        mobile_phone = "";
      let is_email_valid;
      if (graphResponse?.data?.mail) {
        const domain = graphResponse?.data?.userPrincipalName.split("@");
        // console.log("domain: ",domain);
        if (
          domain[1] === process.env.VALID_DOMAIN1 ||
          domain[1] === process.env.VALID_DOMAIN2
        ) {
          is_email_valid = true;
        }
        //is_email_valid = domain[1] === env.VALID_DOMAIN1 || domain[1] === env.VALID_DOMAIN2 ? true : false;
      }
      if (graphResponse?.data?.id && is_email_valid === true) {
        if (graphResponse?.data?.surname) {
          last_name = graphResponse?.data?.surname;
        }
        if (graphResponse?.data?.jobTitle) {
          job_title = graphResponse?.data?.jobTitle;
        }
        if (graphResponse?.data?.userPrincipalName) {
          user_principal_name = graphResponse?.data?.userPrincipalName;
        }
        if (graphResponse?.data?.officeLocation) {
          office_location = graphResponse?.officeLocation;
        }
        if (graphResponse?.data?.mobilePhone) {
          mobile_phone = graphResponse?.data?.mobilePhone;
        }
        req.AD_user_info = {
          id: graphResponse?.data?.id,
          display_name: graphResponse?.data?.displayName,
          first_name: graphResponse?.data?.givenName,
          last_name: last_name,
          email: graphResponse?.data?.mail,
          user_principal_name: user_principal_name,
          job_title: job_title,
          office_location: office_location,
          business_phones: graphResponse?.data?.businessPhones,
          mobile_phone: mobile_phone,
          department: graphResponse?.data?.department,
          dept_id: "66d984304a3b3b153d8dd029"
        };
      
        //console.log("req.AD_user_info: ", req.AD_user_info)
        //console.log("req.AD_manager_info: ", req.AD_manager_info)

        //////  setting referal id
        // let user_referal = await User.findOne({
        //   raw: true,
        //   where: {
        //     email: req.AD_user_info?.email,
        //   },
        // });
        // if (user_referal) {
        //   if (user_referal?.myReferalID === null) {
        //     console.log("user?.myReferalID is null");
        //     let first3 = user_referal.first_name.substring(0, 3).toUpperCase();
        //     console.log("first3: ", first3);
        //     // Function to generate OTP
        //     function generateOTP() {
        //       // Declare a digits variable
        //       // which stores all digits
        //       var digits = "0123456789";
        //       let OTP = "";
        //       for (let i = 0; i < 4; i++) {
        //         OTP += digits[Math.floor(Math.random() * 10)];
        //       }
        //       return first3 + OTP;
        //     }
        //     let referal_id = generateOTP();
        //     let found = await User.findOne({ myReferalID: referal_id });
        //     if (!found) {
        //       const update = await User.update(
        //         { myReferalID: referal_id },
        //         {
        //           where: {
        //             email: req.AD_user_info?.email,
        //           },
        //         }
        //       );
        //     } else {
        //       referal_id = generateOTP();
        //       found = await User.findOne({ myReferalID: referal_id });
        //       const update = await User.update(
        //         { myReferalID: referal_id },
        //         {
        //           where: {
        //             email: req.AD_user_info?.email,
        //           },
        //         }
        //       );
        //     }
        //     console.log("referal_id generated: ", referal_id);
        //   }
        // }
        next();
      } else {
        return res.status(401).send({
          success: false,
          message: "Your email is not valid, please contact admin",
        });
      }
    } else {
      return res.status(401).send({
        success: false,
        message: "Microsoft token has expired, please login",
        error: graphResponse?.data?.error?.message,
      });
    }
  } catch (error) {
    console.log("error in middleware: ", error);
    res.status(500).send({
      success: false,
      message: "Something went wrong! We are investigating the issue",
      error: error,
    });
    return;
  }
};

exports.getADToken = async (req, res, next) => {
  console.log("getADToken  middleware called");
  try {
    const authorityHostUrl = process.env.CLOUD_INSTANCE;
    const tenant = process.env.ADMIN_TENANT_ID;
    const authorityUrl = authorityHostUrl + "/" + tenant;
    const clientId = process.env.ADMIN_CLIENT_ID;
    const clientSecret = process.env.ADMIN_CLIENT_SECRET;
    const resource = "https://graph.microsoft.com/";
    const context = new adal(authorityUrl);
    context.acquireTokenWithClientCredentials(
      resource,
      clientId,
      clientSecret,
      (err, tokenResponse) => {
        if (err) {
          // console.log({
          //     message: "Something went wrong! We are investigating the issue",
          //     error: err})
        } else {
          req.body.accessToken = tokenResponse?.accessToken;
         // console.log("req.body.accessToken: ",req.body.accessToken)
          next();
          return req.body.accessToken;
        }
      }
    );
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong! We are investigating the issue",
      error: err,
    });
    return;
  }
};

