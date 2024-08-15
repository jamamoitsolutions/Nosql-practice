const User = require('../models/User');
const Department = require('../models/Department');
exports.profile = async(req, res) => {
    const getUser = await User.findById(req?.user?.id);
    res.json({message: 'Profile route', user: getUser});
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
