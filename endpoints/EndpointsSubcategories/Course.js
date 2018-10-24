const EndpointCategory = require('../../classes/EndpointCategory.js');
const prefix = require('../common/prefix.js');
const utils = require('../common/utils.js');

// Import subcategories
const Assignment = require('./CourseSubcategories/Assignment.js');
const AssignmentGroup = require('./CourseSubcategories/AssignmentGroup.js');
const App = require('./CourseSubcategories/App.js');
const GradebookColumn = require('./CourseSubcategories/GradebookColumn.js');
const GroupSet = require('./CourseSubcategories/GroupSet.js');
const Page = require('./CourseSubcategories/Page.js');
const Quiz = require('./CourseSubcategories/Quiz.js');
const Rubric = require('./CourseSubcategories/Rubric.js');
const Section = require('./CourseSubcategories/Section.js');

class Course extends EndpointCategory {
  constructor(config) {
    super(config, Course);
  }
}

/*------------------------------------------------------------------------*/
/*                             Subcategories:                             */
/*------------------------------------------------------------------------*/

Course.assignment = Assignment;
Course.assignmentgroup = AssignmentGroup;
Course.app = App;
Course.gradebookcolumn = GradebookColumn;
Course.groupset = GroupSet;
Course.page = Page;
Course.quiz = Quiz;
Course.rubric = Rubric;
Course.section = Section;

/*------------------------------------------------------------------------*/
/*                               Endpoints:                               */
/*------------------------------------------------------------------------*/

/**
 * Gets info on a specific course
 * @method get
 * @param {number} courseId - Canvas course Id to get info on
 * @param {boolean} [includeSyllabus=false] - If truthy, includes syllabus
 *   body
 * @param {boolean} [includeTerm=false] - If truthy, includes term
 * @param {boolean} [includeAccount=false] - If truthy, includes account Id
 * @param {boolean} [includeDescription=false] - If truthy, includes public
 *   description
 * @param {boolean} [includeSections=false] - If truthy, includes sections
 * @param {boolean} [includeTeachers=false] - If truthy, includes teachers
 * @param {boolean} [includeCourseImage=false] - If truthy, includes the
 *   course image
 * @param {boolean} [includeNeedsGradingCount=false] - If truthy, includes the
 *   number of students who still need to be graded
 * @return {Promise.<Object>} Canvas course {@link https://canvas.instructure.com/doc/api/courses.html#Course}
 */
Course.get = (config) => {
  // @action: get info on a specific course
  return config.visitEndpoint({
    path: `${prefix.v1}/courses/${config.options.courseId}`,
    method: 'GET',
    params: {
      include: utils.includeTruthyElementsExcludeIfEmpty([
        (config.options.includeSyllabus ? 'syllabus_body' : null),
        (config.options.includeTerm ? 'term' : null),
        (config.options.includeAccount ? 'account' : null),
        (config.options.includeDescription ? 'public_description' : null),
        (config.options.includeSections ? 'sections' : null),
        (config.options.includeTeachers ? 'teachers' : null),
        (config.options.includeCourseImage ? 'course_image' : null),
        (config.options.includeNeedsGradingCount
          ? 'needs_grading_count' : null),
      ]),
    },
  });
};

/**
 * Gets the list of enrollments in a course
 * @method listEnrollments
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [types=all] - list of enrollment types to include:
 *   ['student', 'ta', 'teacher', 'designer', 'observer']
 *   Defaults to all types.
 * @param {string} [activeOnly=false] - If truthy, only active enrollments
 *   included
 * @param {string} [includeAvatar=false] - If truthy, avatar_url is included
 * @param {string} [includeGroups=false] - If truthy, group_ids is included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listEnrollments = (config) => {
  // @action: get enrollments from a course
  const params = {};

  // Enrollment types
  if (config.options.types) {
    params.type = config.options.types.map((type) => {
      if (type.includes('Enrollment')) {
        return type;
      }
      return type.charAt(0).toUpperCase() + type.substr(1) + 'Enrollment';
    });
  }

  // Filter to only active
  if (config.options.activeOnly) {
    params.state = ['active'];
  }

  // Include avatar
  if (config.options.includeAvatar) {
    params.include = ['avatar_url'];
  }

  // Include groups
  if (config.options.includeGroups) {
    if (!params.include) {
      params.include = [];
    }
    params.include.push('group_ids');
  }

  return config.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${config.options.courseId}/enrollments`,
    method: 'GET',
  });
};

/**
 * Gets the list of students in a course
 * @method listStudents
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [activeOnly=false] - If truthy, only active enrollments
 *   included
 * @param {string} [includeAvatar=false] - If truthy, avatar_url is included
 * @param {string} [includeGroups=false] - If truthy, group_ids is included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listStudents = (config) => {
  // @action: get the list of students in a course
  const newOptions = config.options;
  newOptions.types = ['student'];
  return config.api.course.listEnrollments(newOptions);
};

/**
 * Gets the list of TAs and Teachers in a course
 * @method listTeachingTeamMembers
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [activeOnly=false] - If truthy, only active enrollments
 *   included
 * @param {string} [includeAvatar=false] - If truthy, avatar_url is included
 * @param {string} [includeGroups=false] - If truthy, group_ids is included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listTeachingTeamMembers = (config) => {
  // @action: get the list of TAs and Teachers in a course
  const newOptions = config.options;
  newOptions.types = ['ta', 'teacher'];
  return config.api.course.listEnrollments(newOptions);
};

/**
 * Gets the list of designers in a course
 * @method listDesigners
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [activeOnly=false] - If truthy, only active enrollments
 *   included
 * @param {string} [includeAvatar=false] - If truthy, avatar_url is included
 * @param {string} [includeGroups=false] - If truthy, group_ids is included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listDesigners = (config) => {
  // @action: get the list of designers in a course
  const newOptions = config.options;
  newOptions.types = ['designer'];
  return config.api.course.listEnrollments(newOptions);
};

/**
 * Gets the list of observers in a course
 * @method listObservers
 * @param {number} courseId - Canvas course Id to query
 * @param {string} [activeOnly=false] - If truthy, only active enrollments
 *   included
 * @param {string} [includeAvatar=false] - If truthy, avatar_url is included
 * @param {string} [includeGroups=false] - If truthy, group_ids is included
 * @return {Promise.<Object[]>} list of Canvas Enrollments {@link https://canvas.instructure.com/doc/api/enrollments.html#Enrollment}
 */
Course.listObservers = (config) => {
  // @action: get the list of observers in a course
  const newOptions = config.options;
  newOptions.types = ['observer'];
  return config.api.course.listEnrollments(newOptions);
};

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Course;
