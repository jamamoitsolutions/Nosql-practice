const mongoose = require("mongoose");
const { Schema } = mongoose;

const departmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    hod: {
        type: Schema.Types.ObjectId,
        ref: "User",
        trim: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    }, {
        timestamps: true  // Add createdAt and updatedAt fields automatically
      });

    const Department = mongoose.model("Department", departmentSchema);

    module.exports = Department;