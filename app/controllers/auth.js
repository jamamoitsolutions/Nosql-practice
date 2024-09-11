const { User } = require('../models/index');
const jwt = require('jsonwebtoken');
const fetch = require('../helpers/fetch');
const transporter = require('../helpers/mailconfig');
const MaskData = require('maskdata');

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
     
  res.json({
    message: 'Login route', 
    user_info: {id: check?._id, email: check?.email,
       name: check?.name,
        role: check?.role}
        ,
         token: token});
    }catch(err){
        console.log("error",err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

exports.azure_login = async (req, res) => {
  try {
      console.log("contro..AD user info", req?.AD_user_info);
      if(req?.AD_user_info?.email === 'support@jamamo.in'){
          delete req.AD_user_info.dept_id;
      }
      console.log("contro..AD user info", req?.AD_user_info);
      const operations = [{
        updateOne: {
          filter: { user_id: req?.AD_user_info.id },
          update: req?.AD_user_info,
          upsert: true  // Insert if not found
        }
      }];
    const insert_or_update = await User.bulkWrite(operations);
    console.log("insert_or_update: ", insert_or_update);

    const user_details = await User.findOne({
       user_id: req.AD_user_info?.id
    });
    console.log("user_details: ",user_details)
    //logic to get courses owner
    let isCourseOwner = false;
    let isDashboardOwner = false;
    // let userApp = await courses_owners.findOne({
    //     user_id: req.AD_user_info?.id,
    //     is_active: true,
    // });
    // if (userApp) {
    //   isCourseOwner = true;
    // }

    // console.log("find res",user_details);
    if (user_details === null) {
      res.status(200).send({
        success: false,
        message: "Your account is not found in JITS, contact admin team.",
      });
      return;
    }
    if (user_details.is_active === false) {
      res.status(401).send({
        success: false,
        status_type: 401,
        message: "Your account is not active, contact admin team",
      });
      return;
    }
    const maskPhoneOptions = {
      // Character to mask the data. The default value is '*'
      maskWith: "*",
    
      // Should be positive Integer
      // If the starting 'n' digits need to be visible/unmasked
      // Default value is 4
      unmaskedStartDigits: 4,
    
      // Should be positive Integer
      // If the ending 'n' digits need to be visible/unmasked
      // Default value is 1. 
      unmaskedEndDigits: 3
    };
    jwt.sign(
      {
        id: user_details.id,
        user_id: user_details.user_id,
        job_title: user_details?.job_title,
        fullname:
          user_details?.first_name || "User" + " " + user_details?.last_name,
        first_name: user_details?.first_name,
        last_name: user_details?.last_name || " ",
        department: user_details?.department,
        role: user_details?.role,
        email: user_details?.email,
        mobile: user_details?.mobile_phone ? MaskData.maskPhone(user_details?.mobile_phone, maskPhoneOptions) : "",
        user_principal_name: user_details?.user_principal_name,
        reporting_manager: user_details?.reporting_manager,
        myReferalID: user_details?.myReferalID,
        is_active: user_details?.is_active,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
      async(err, token) => {
        try {
          let d = new Date().toString().split(" ").splice(1, 3).join(" ");
          let darr = d.split(" ");
          let mydate = darr[1] + " " + darr[0] + " " + darr[2];
          const message = {
            from: `Jamamo Support <${process.env.Email_ID}>`,
            to: "vikramraimumbai@gmail.com",
            subject: `Logged-in successfully (${user_details?.email})`,
            template: "loginsuccess",
            context: {
              sender_name: `Support Team`,
              sender_email: `${process.env.Email_ID}`,
              // approval_id: `${approval_id}`,
              reciever_name: `Vikram Kumar`,
              date: `${mydate}`,
            },
          };
          try{
            let emailsent =  transporter.sendMail(message);
            //  console.log("login success: ", emailsent);
          }
          catch(err){
            console.log("login success email error: ", err);
          }
        } catch (err) {
          console.log("login success email error: ", err);
        }
        if (err) throw err;
        else
          res.status(200).send({
            success: true,
            message: "Welcome! to Jamamo IT Solutions.",
            user_details: {
              id: user_details?.id,
              user_id: user_details?.user_id,
              fullname:
              user_details?.display_name ? user_details?.display_name:(user_details?.first_name + " " + user_details?.last_name),
              first_name: user_details?.first_name,
              last_name: user_details?.last_name || " ",
              email: user_details?.email,
              job_title: user_details?.job_title,
              department: user_details?.department,
              role: user_details?.role,
              mobile: user_details?.mobile_phone ? MaskData.maskPhone(user_details?.mobile_phone, maskPhoneOptions) : "",
              reporting_manager: user_details?.reporting_manager,
              is_active: user_details?.is_active,
              myReferalID: user_details?.myReferalID,
              isCourseOwner,
              isDashboardOwner,
            },
            token,
          });
      }
    );
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Something went wrong. We are looking into it.",
      error: err?.message,
    });
  }
};

exports.send_azure_invite = async (req, res) => {
  try {
    let d = new Date().toString().split(" ").splice(1, 3).join(" ");
    let darr = d.split(" ");
    let mydate = darr[1] + " " + darr[0] + " " + darr[2];

    const handlebarOptions = {
      viewEngine: {
        extname: ".hbs",
        partialsDir: path.resolve("./email/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./email/"),
      extName: ".hbs",
    };
    transporter.use("compile", hbs(handlebarOptions));
    // console.log("req: ", req)
    const { full_name, email } = req.body;
    let token = req.body?.accessToken; // (internal)
    //console.log(`token in invite: (${email})`, token);
    if (!email) {
      res.status(500).send({
        success: false,
        message: "Email is required.",
      });
      return;
    }
    if (!token) {
      res.status(500).send({
        success: false,
        message: "Something went wrong, we are looking into it.",
        error: "internal token issue",
      });
      return;
    }

    ////Graph api call
    const endpoint = "https://graph.microsoft.com/v1.0/invitations";
    let display_name, payload;
    if (full_name) {
      display_name = full_name + " (Guest)";
      let whatsapp = "https://chat.whatsapp.com/CRli8zvCfVD4PM9Umkf3Mq";
      let message = ` Dear ${full_name},  You're invited to Jamamo IT Solutions - coding learning platform. Now you can login using your registered email address.`;
      payload = {
        invitedUserEmailAddress: email.trim(),
        inviteRedirectUrl: "https://jamamo.in/demo",
        invitedUserDisplayName: display_name,
        resetRedemption: false,
        sendInvitationMessage: true,
        invitedUserMessageInfo: {
          customizedMessageBody: message,
        },
      };
    } else {
      payload = {
        invitedUserEmailAddress: email.trim(),
       // inviteRedirectUrl: "https://jamamo.in",
      // inviteRedirectUrl: "http://localhost:3000/profile",
      };
    }
    const graphResponse = await fetch("post", endpoint, payload, token);
    if (graphResponse?.data?.error) {
      throw graphResponse?.data?.error;
    } else {
     // console.log("graphResponse in invite cont: ", graphResponse?.data);
      ////  update first name
      let endpoint2 = `https://graph.microsoft.com/v1.0/users/${graphResponse?.data?.invitedUser?.id}`;
      let payload2 = {
        givenName: full_name ? full_name : email.split("@")[0],
        surname: " (Guest)",
        country: "India",
        jobTitle: "Learner",
        employeeHireDate: new Date(),
        department: "Student",
        companyName: "JAMAMO IT SOLUTIONS",
      };
      // console.log("payload update first_name: ", payload);
      const update_GraphResponse = await fetch(
        "patch",
        endpoint2,
        payload2,
        token
      );
      res.status(200).send({
        success: true,
        message: "User invitation has been created",
        invite_details: {
          inviteRedeemUrl: graphResponse?.data?.inviteRedeemUrl,
          user_id: graphResponse?.data?.invitedUser?.id,
          email: graphResponse?.data?.invitedUserEmailAddress,
        },
      });
      ////////////   email notification
      try {
        const message = {
          from: `Jamamo Support <${process.env.Email_ID}>`,
          to: `${email}, jamamoitsolutions@gmail.com`,
          subject: "Welcome to Jamamo Learning Platform",
          template: "welcome",
          context: {
            sender_name: `Jamamo Support`,
            sender_email: `${process.env.Email_ID}`,
            // approval_id: `${approval_id}`,
            reciever_name: `${full_name}`,
            date: `${mydate}`,
          },
        };
        let emailsent = transporter.sendMail(message);
       // console.log("welcome success: ", emailsent);
      } catch (err) {
        console.log("welcome success email error: ", err);
      }
    }
    /////////////////////
    //   {
    //     "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#invitations/$entity",
    //     "id": "01958fd7-b29d-4fae-a2cc-f375a7f0b029",
    //     "inviteRedeemUrl": "https://login.microsoftonline.com/redeem?rd=https%3a%2f%2finvitations.microsoft.com%2fredeem%2f%3ftenant%3dfdd9f042-2064-4553-96f7-810892eb2d70%26user%3d01958fd7-b29d-4fae-a2cc-f375a7f0b029%26ticket%3dzSUpxYBufL0EnV4bDsD5%25252fzZsSyD%25252fvteIXqncFQ8jDBc%25253d%26ver%3d2.0",
    //     "invitedUserDisplayName": null,
    //     "invitedUserType": "Guest",
    //     "invitedUserEmailAddress": "vikramraihzb@gmail.com",
    //     "sendInvitationMessage": false,
    //     "resetRedemption": false,
    //     "inviteRedirectUrl": "https://jamamo.in/",
    //     "status": "PendingAcceptance",
    //     "invitedUserMessageInfo": {
    //         "messageLanguage": null,
    //         "customizedMessageBody": null,
    //         "ccRecipients": [
    //             {
    //                 "emailAddress": {
    //                     "name": null,
    //                     "address": null
    //                 }
    //             }
    //         ]
    //     },
    //     "invitedUser": {
    //         "id": "9f55a55d-212f-47ae-b9d4-47c536fb296c"
    //     }
    // }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. We are looking into it.",
      error: err,
    });
  }
};