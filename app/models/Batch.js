const mongoose = require('mongoose');
const { Schema } = mongoose;

const batchSchema = new Schema({
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  batch_name: {
    type: String,
    trim: true,
    required: [true, 'Batch name is required'],
    minlength: [3, 'Batch name must be at least 3 characters long'],
    maxlength: [100, 'Batch name cannot exceed 100 characters'],
  },
  batch_description: {
    type: String,
    maxlength: [500, 'Batch description cannot exceed 500 characters'],
  },
  batch_url: {
    type: String,
    maxlength: [500, 'Batch URL cannot exceed 500 characters'],
    validate: {
      validator: function (v) {
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`,
    },
  },
  batch_type: {
    type: String,
    trim: true,
    required: [true, 'Batch type is required'],
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function (v) {
        return v instanceof Date && !isNaN(v.valueOf());
      },
      message: props => `${props.value} is not a valid start date`,
    },
  },
  end_date: {
    type: Date,
    validate: {
      validator: function (v) {
        return v instanceof Date && !isNaN(v.valueOf());
      },
      message: props => `${props.value} is not a valid end date`,
    },
  },
  class_duration: {
    type: Number,
    min: [1, 'Class duration must be at least 1 minute'],
    required: [true, 'Class duration is required'],
  },
  wa_group: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'cancelled', 'upcoming'],
      message: '{VALUE} is not a valid status',
    },
    default: 'upcoming',
  },
  createdBy_id: {
    type: Schema.Types.ObjectId, // Use String if UUID isn't supported
    required: true,
    ref: 'User',
    required: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  }
});

// Virtual for batches
batchSchema.virtual('members', {
    ref: 'BatchesMember',                 // The model to use
    localField: '_id',             // The field in the course schema
    foreignField: 'batch_id',     // The field in the batch schema that references the course
  });
  
  // Ensure virtual fields are included when using JSON
  batchSchema.set('toObject', { virtuals: true });
  batchSchema.set('toJSON', { virtuals: true });


const Batch = mongoose.model('Batch', batchSchema);
module.exports = Batch;
