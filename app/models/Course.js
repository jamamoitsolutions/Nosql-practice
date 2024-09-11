const mongoose = require('mongoose');
const { Schema } = mongoose;

// Regular expression for validating URLs
const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})(:[0-9]{1,5})?(\/[^\s]*)?$/;
;

const courseSchema = new Schema({
  course_name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [3, 'Course name must be at least 3 characters long'],
    maxlength: [100, 'Course name cannot exceed 100 characters'],
  },
  course_description: {
    type: String,
    trim: true,
    maxlength: [500, 'Course description cannot exceed 500 characters'],
  },
  course_content: {
    type: String,
    trim: true,
  },
  how_to_use: {
    type: String,
    trim: true,
  },
  benifits: {
    type: String,
    trim: true,
  },
  youtube_url: {
    type: String,
    trim: true,
    match: [urlRegex, 'Invalid URL format for YouTube URL'],
  },
  course_url: {
    type: String,
    trim: true,
    match: [urlRegex, 'Invalid URL format for Course URL'],
  },
  access_type: {
    type: String,
    enum: ['open', 'restricted', 'upcoming'],
    required: [true, 'Access type is required'],
  },
  isWeb: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isBoth: {
    type: Boolean,
    default: false,
  },
  staging_url: {
    type: String,
    match: [urlRegex, 'Invalid URL format for Staging URL'],
  },
  sme_contact: {
    type: String,
    trim: true,
  },
  is_launch_restricted: {
    type: Boolean,
    default: false,
  },
  course_fee_type: {
    type: String,
    default: "course",
  },
  course_fee: {
    type: Number,
    min: [0, 'Course fee must be a positive number'],
    default: 4999,
  },
  course_discount: {
    type: Number,
    min: [0, 'Discount must be a positive number'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0,
  },
  course_discount_type: {
    type: String,
    default: "percentage",
  },
  course_discount_start_date: {
    type: Date,
  },
  course_discount_end_date: {
    type: Date,
    validate: {
      validator: function (value) {
        return !this.course_discount_start_date || value > this.course_discount_start_date;
      },
      message: 'Discount end date must be greater than start date',
    },
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
    timestamps: true  // Add createdAt and updatedAt fields automatically
  });

// Virtual for batches
courseSchema.virtual('batches', {
    ref: 'Batch',                 // The model to use
    localField: '_id',             // The field in the course schema
    foreignField: 'course_id',     // The field in the batch schema that references the course
  });
  
  // Ensure virtual fields are included when using JSON
  courseSchema.set('toObject', { virtuals: true });
  courseSchema.set('toJSON', { virtuals: true });


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
