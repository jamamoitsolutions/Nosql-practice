const {User , Department, Course, Batch, BatchesMember} = require('../models');
const {getPagination, pagination} = require('../helpers/pagination');
const transporter = require('../helpers/mailconfig');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');


// write get api for mongoose get all courses from Course model which is in model folder with pagination and send response as courses with pagination with error handling with search

exports.getCourseList = async (req, res) => {
    try {
        const {search, per_page=10 , page=1} = req?.query;

        // Find all courses with pagination
        const getList = await Course.find(
            {
               $or : [ {course_name: {$regex: `${search}`, $options: 'i'}
                  }, {course_description: {$regex: `${search}`, $options: 'i'}}
                ]
            },
            {course_name: true, course_description: true, course_content: true, course_fee: true, course_discount_type: true, course_discount: true, course_discount_start_date: true, course_discount_end_date: true,is_active: true}
        )
        // .populate({path:'dept_id', select:'name', populate: {path: 'hod', match: { is_active: true }, select: 'name email'}})
        .skip((parseInt(page)-1) * parseInt(per_page))
        .limit(parseInt(per_page))
        ;
        const totalUsers = await Course.countDocuments();
    
        res.send({message: 'Course List fetched successfully', pagination: {
            totalRows: totalUsers,
            totalPages: Math.ceil(totalUsers/per_page),
            currentPage: parseInt(page),
        },data: getList});
    } catch (error) {
        console.log('Error in getting courses: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Could not get courses.',
            error: error.message,
        });
    }
}

exports.getCoursesBatchesUpcoming = async (req, res) => {
    try {
        const {search='', per_page=10 , page=1, batch_type='demo'} = req?.query;

        // Find all courses with pagination
        const getList = await Course.find(
            {
               $or : [ {course_name: {$regex: `${search}`, $options: 'i'}
                  }, {course_description: {$regex: `${search}`, $options: 'i'}}
                ]
            },
            {course_name: true, course_description: true, course_content: true, course_fee: true, course_discount_type: true, course_discount: true, course_discount_start_date: true, course_discount_end_date: true,is_active: true}
        )
        .populate({path: 'batches', model: 'Batch', select:'batch_name start_date end_date class_duration', match: {batch_type: batch_type, status: 'upcoming'}, populate: {path:'createdBy_id', select:'display_name first_name last_name email is_active'}})   
        .skip((parseInt(page)-1) * parseInt(per_page))
        .limit(parseInt(per_page))
        ;
        const totalCourse = await Course.countDocuments();
    
        res.send({success: true, message: 'Upcoming Course List fetched successfully', pagination: {
            totalRows: totalCourse,
            totalPages: Math.ceil(totalCourse/per_page),
            currentPage: parseInt(page),
        },data: getList});
    } catch (error) {
        console.log('Error in getting courses: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Could not get courses.',
            error: error.message,
        });
    }
}

exports.getBatchList = async (req, res) => {
    try {
        const {search, per_page=10 , page=1, course_id} = req?.query;

        // Find all courses with pagination
        const getList = await Batch.find(
            {
               $or : [ {batch_name: {$regex: `${search}`, $options: 'i'}
                  }, {batch_description: {$regex: `${search}`, $options: 'i'}}
                ]
            },
            {batch_name: true, batch_description: true, batch_url: true, batch_type: true, start_date: true, end_date: true, class_duration: true, wa_group: true, remarks: true, status: true,is_active: true}
        )
         .populate({path:'course_id', select:'course_name' })
        .skip((parseInt(page)-1) * parseInt(per_page))
        .limit(parseInt(per_page))
        ;
        const totalBatch = await Batch.countDocuments();
    
        res.send({message: 'Batch List fetched successfully', pagination: {
            totalRows: totalBatch,
            totalPages: Math.ceil(totalBatch/per_page),
            currentPage: parseInt(page),
        },data: getList});
    } catch (error) {
        console.log('Error in getting batches: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Could not get batches.',
            error: error.message,
        });
    }
}

exports.submitDemoForm = async (req, res) => {
    const user_details = req.user;
    const {  mobile, course, slot } = req.body;
    let token = req.body?.accessToken;
    try {
       // add mobile to AD
    //    try{
    //     const update_user_mobile =  fetch(
    //       "patch",
    //       `https://graph.microsoft.com/v1.0/users/${req.user.user_id}`,
    //       {
    //         "mobilePhone": mobile
    //       }
    //       ,
    //       token
    //     );
    //     console.log("update_user_mobile patch response: ", update_user_mobile);
    //   }catch(err){
    //     console.log("error at add mobile to AD: ", err)
    //   }
      try{
         const batch_member = await BatchesMember.create({  batch_id: slot, user_id: user_details.id });  
        // console.log("batch_member api res: ", batch_member)
        const getBatch  = await Batch.find({id: slot});
        res.status(200).send({ success: true, message: "Your Demo class has been booked." });
        ////////////   email notification
        let d = new Date().toString().split(" ").splice(1, 3).join(" ");
        let darr = d.split(" ");
        let mydate = darr[1] + " " + darr[0] + " " + darr[2];
    
        const handlebarOptions = {
          viewEngine: {
            extname: ".hbs",
            partialsDir: path.resolve("./app/email/"),
            defaultLayout: false,
          },
          viewPath: path.resolve("./app/email/"),
          extName: ".hbs",
        };
        transporter.use("compile", hbs(handlebarOptions));
        try {
         let email = req?.user?.email || `support@jamamo.in`;
         let full_name = req?.user?.first_name || `Vikram Kumar`;
         const message = {
           from: `Jamamo Support <${process.env.Email_ID}>`,
           to: `${email}`,
           bcc: `support@jamamo.in, jamamoitsolutions@gmail.com`,
           subject: "Demo Class Booked(Jamamo Learning)",
           template: "bookdemo",
           context: {
             sender_name: `Jamamo Support`,
             sender_email: `${process.env.Email_ID}`,
             // approval_id: `${approval_id}`,
             reciever_name: `${full_name}`,
             reciever_mobile: mobile,
             wa_group: getBatch?.wa_group || 'https://whatsapp.com/channel/0029VaGkTB73WHTbg4utzF1p',
             date: `${mydate}`,
           },
         };
         let emailsent = await transporter.sendMail(message);
       //   console.log("demo book email success: ", emailsent);
       } catch (err) {
         console.log("demo book success email error: ", err);
       }
    
      }catch(err){
        // console.log("error at add_owner_member:  ", err);
        throw err;
      }
      
     
    } catch (err) {
        // console.log("error at submit democlass form: ", err);
      res.status(500).send({ success: false, message: "Failed to book Demo class!", error: err });
    }
  };



exports.getBookedDemo = async (req, res) => { 
    try {
        const {search='', per_page=10 , page=1,} = req?.query;

        // Find all courses with pagination
        // console.log("req.user.id: ", req.user);
        const batchMembers = await BatchesMember.find(
            {
                user_id: req.user.id, is_active: true
            }
        )
         .populate({path:'batch_id'})
        
         if (!batchMembers || batchMembers.length === 0) {
            return res.status(200).json({success: true, message: 'No batches found.' });
          }
      
          // Extract and return the populated batch details
          const batches = batchMembers.map(member => member.batch_id);
    
        res.send({success: true, message: 'Booked Batch List fetched successfully', data: batches});
    } catch (error) {
        console.log('Error in getting batches: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Could not get batches.',
            error: error.message,
        });
    }
}
