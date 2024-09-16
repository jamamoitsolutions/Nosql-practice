const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    user_id: {
        type: String,
        required: false,
        trim: true,
        unique: true
    },
    auth: {
      type: String,
      default: 'azure',
      enum: ['basic', 'azure']
  },
    display_name: {
        type: String,
        required: true,
        trim: true
    },
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    reporting_manager: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
      department: {
        type: String,
      },
      job_title: {
        type: String,
        required:false,     
      },
      office_location: {
        type: String,
        required:false,     
      },
      business_phones: {
        type: JSON,
        required:false,
        defaultValue: []     
      },
      mobile_phone: {
        type: String,
        required: false,     
      },
      myReferalID :{
        type: String,
        required: false, 
      },
    dept_id: {
        type: Schema.Types.ObjectId,
        ref: 'Department'
    },
    dob: {
      type: Date,
      required: false
  },
  password: {
      type: String,
      required: false
  },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
  timestamps: true  // Add createdAt and updatedAt fields automatically
});

UserSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    // if (user.isModified('dob')) {
    //     user.age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    // }
    next();
});

module.exports = mongoose.model('User', UserSchema);