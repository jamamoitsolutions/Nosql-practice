const { User, Department, Course, Batch, BatchesMember } = require('../models/index');
const { getPagination, pagination } = require('../helpers/pagination');
const MaskData = require('maskdata');

exports.profile = async(req, res) => {
  console.log("db: ", db)
  const {profile} = req?.query;
    let getUser;
    if(profile === "azure"){
      getUser = await User.findById(req?.user?.id);
    }else{
    getUser = await User.findById(req?.user?.id);
    }
    if(!getUser){
      getUser = await User.findById(req?.user?.id);
        return res.status(404).json({success: false,message: 'User not found'});
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
    res.json({success: true, message: 'Profile fetched successfully',
       user: {
        id: getUser?.id,
        user_id: getUser?.user_id,
        fullname:
        getUser?.display_name ? getUser?.display_name:(getUser?.first_name + " " + getUser?.last_name),
        first_name: getUser?.first_name,
        last_name: getUser?.last_name || " ",
        email: getUser?.email,
        job_title: getUser?.job_title,
        department: getUser?.department,
        role: getUser?.role,
        mobile: getUser?.mobile_phone ? MaskData.maskPhone(getUser?.mobile_phone, maskPhoneOptions) : "",
        reporting_manager: getUser?.reporting_manager,
        is_active: getUser?.is_active,
        myReferalID: getUser?.myReferalID,
        isCourseOwner: false,
        isDashboardOwner: false,
       }});
}

exports.list = async(req, res) => {
    const {search, per_page=10 , page=1} = req?.query;
    const getList = await User.find(
        {
           $or : [ {name: {$regex: `${search}`, $options: 'i'}
              }, {email: {$regex: `${search}`, $options: 'i'}}
            ]
        },
        {name: true, email: true,  role: true, is_active: true}
    )
    .populate({path:'dept_id', select:'name', populate: {path: 'hod', match: { is_active: true }, select: 'name email'}})
    .skip((parseInt(page)-1) * parseInt(per_page))
    .limit(parseInt(per_page))
    ;
    const totalUsers = await User.countDocuments();

    res.send({message: 'User List route', pagination: {
        totalUsers: totalUsers,
        totalPages: Math.ceil(totalUsers/per_page),
        currentPage: parseInt(page),
    },data: getList});

}

exports.addDepartment = async(req, res) => {
    console.log("req.body: ",req?.body);
    const {name, hod, is_active} = req?.body;
    const new_department = new Department({
        name,
        hod,
        is_active
    });

    const department = await new_department.save();
    res.json({message: 'Department added successfully', department});

}

exports.deptList = async(req, res) => {
    const {search, per_page=10 , page=1} = req?.query;
    console.log("search deptList: ",search);
    const getList = await Department.aggregate([
      {
        $lookup: {
            from: 'users',
            localField: 'hod',
            foreignField: '_id',
            as: 'hod'
        }
      },
      {
           $match: {
            $and : [ {name: {$regex: `${search}`, $options: 'i'}
              }, 
              {
                $expr: { $gt: [ { $size: "$users" }, 0 ] }
              }
              //{email: {$regex: `${search}`, $options: 'i'}}
            ]
           }
        },
        {
            $project: {
                name: true,
                users: { $size: "$users" },
                is_active: true,
                hod: {
                    $filter: {
                        input: "$hod",
                        as: "hod",
                        cond: { $eq: ["$$hod.is_active", true] }
                    }
                }
            }
        }
    ])
    //        $or : [ {name: {$regex: `${search}`, $options: 'i'}
    //     },
    //     {name: true, is_active: true}
    // )
    // .populate({path: 'hod', match: { is_active: true }, select: 'name email'})
    // .skip((parseInt(page)-1) * parseInt(per_page))
    // .limit(parseInt(per_page))
    // ;
    const totalDepartments = await Department.countDocuments();

    res.send({message: 'Department List route', pagination: {
        totalDepartments: totalDepartments,
        totalPages: Math.ceil(totalDepartments/per_page),
        currentPage: parseInt(page),
    },data: getList});

}

exports.getPublicInfo = async (req, res) => {
    try {
       console.log("getPublicAnouncement api ");
       let users_count = 0;
      // active users count.
      try{
          users_count = await User.countDocuments({ is_active: true });
      }catch(err){
          console.log("error to get users count: ", err)
      }
      // active courses count.
      let courses_count = 0;
      try{
        courses_count = await Course.countDocuments({ is_active: true });
    }catch(err){
        console.log("error to get courses count: ", err)
    }

          // active projects count.
          let projects_count = 10;
          try{
            projects_count = await Project.countDocuments({ is_active: true });
        }catch(err){
            console.log("error to get projects count: ", err)
        }

                // active client count.
                let clients_count = 5;
                try{
                  clients_count = await Client.countDocuments({ is_active: true });
              }catch(err){
                  console.log("error to get clients count: ", err)
              }
  
      const { page, per_page } = req.query;
  
      res.status(200).send({
        success: true,
        users_count,
        courses_count,
        projects_count,
        clients_count,
        years_of_experience: 7,
        public_anouncement_info : [],
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Something went wrong. We are looking into it.",
        error: err.message,
      });
    }
  };

exports.deptListWithUsers = async(req, res) => {
    const {search, per_page=10 , page=1} = req?.query;
    console.log("search deptListWithUsers: ",search);
    const getList = await Department.find(
        {
           $or : [ {name: {$regex: `${search}`, $options: 'i'}
              }, //{email: {$regex: `${search}`, $options: 'i'}}
            ]
        },
        {name: true, is_active: true}
    )
    .populate({path: 'hod', match: { is_active: true }, select: 'name email'})
    .skip((parseInt(page)-1) * parseInt(per_page))
    .limit(parseInt(per_page))
    ;
    const totalDepartments = await Department.countDocuments();

    res.send({message: 'Department List route', pagination: {
        totalDepartments: totalDepartments,
        totalPages: Math.ceil(totalDepartments/per_page),
        currentPage: parseInt(page),
    },data: getList});

}
