const { User, Department, Course, Batch } = require('../models/index');
const { getPagination, pagination } = require('../helpers/pagination');


// write post api for insert data into Course model which is in model folder for all fields with validation and send response as Course added successfully with error handling

exports.addCourse = async (req, res) => {
try {
    const courseData = req.body;

    // Validate required fields manually if needed
    if (!courseData.course_name) {
      return res.status(400).json({success: false,  message: 'Course name is required' });
    }
    if (!courseData.access_type) {
      return res.status(400).json({success: false, message: 'Access type is required' });
    }

    // Create a new course instance with Mongoose validation
    const newCourse = new Course(courseData);

    // Save the course to the database
    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: 'Course added successfully',
      course: savedCourse,
    });
  } catch (error) {
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({success: false,  message: messages });
    }

    // General error handling
    res.status(500).json({
        success: false,
      message: 'Server error. Could not add course.',
      error: error.message,
    });
  }
}

exports.addBatch = async (req, res) => {
    try {
        const batchData = req.body;
    
        // Validate required fields manually if needed
        if (!batchData.batch_name) {
          return res.status(400).json({success: false,  message: 'Batch name is required' });
        }
        if (!batchData.batch_type) {
          return res.status(400).json({success: false, message: 'Batch type is required' });
        }
    
        // Create a new batch instance with Mongoose validation
        const newBatch = new Batch(batchData);
    
        // Save the course to the database
        const savedBatch = await newBatch.save();
    
        res.status(201).json({
          message: 'Batch added successfully',
          batch: savedBatch,
        });
      } catch (error) {
        // Check for validation errors
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({success: false,  message: messages });
        }
    
        // General error handling
        res.status(500).json({
            success: false,
          message: 'Server error. Could not add batch.',
          error: error.message,
        });
      }
    }

