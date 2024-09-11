const db = {};
const User = require('./User');
const Department = require('./Department');
const Course = require('./Course');
const Batch = require('./Batch');
const BatchesMember = require('./BatchesMember');

db.User = User;
db.Department = Department;
db.Course = Course;
db.Batch = Batch;
db.BatchesMember = BatchesMember;

module.exports = db;
