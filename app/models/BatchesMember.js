const mongoose = require('mongoose');
const { Schema } = mongoose;

const batchesMemberSchema = new Schema({
  batch_id: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_type: {
    type: String,
    required: true,
    default: 'learner',
    enum: ['learner', 'instructor', 'admin'],  // Add specific user types if needed
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ['under review', 'approved', 'rejected', 'on hold'],
      message: '{VALUE} is not a valid status',
    },
    default: 'under review',
  },
  actionTakenBy_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
  },
  actionTakenAt: {
    type: Date,
    validate: {
      validator: function (v) {
        return v instanceof Date && !isNaN(v.valueOf());
      },
      message: props => `${props.value} is not a valid date`,
    },
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true  // Add createdAt and updatedAt fields automatically
});

batchesMemberSchema.index({ user_id: 1, batch_id: 1 }, { unique: true });

// Mongoose model
const BatchesMember = mongoose.model('BatchesMember', batchesMemberSchema);
module.exports = BatchesMember;
