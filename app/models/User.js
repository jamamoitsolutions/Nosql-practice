const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    age: {
        type: Number
    },
    dob: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    dept_id: {
        type: Schema.Types.ObjectId,
        ref: 'Department'
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    if (user.isModified('dob')) {
        user.age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);