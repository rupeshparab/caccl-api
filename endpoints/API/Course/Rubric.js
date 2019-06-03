/**
 * Functions for interacting with rubrics within courses
 * @class api.course.rubric
 */

const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');
const utils = require('../../common/utils');

class Rubric extends EndpointCategory {
  constructor(config) {
    super(config, Rubric);
  }
}

/*------------------------------------------------------------------------*/
/*                            Rubric Endpoints                            */
/*------------------------------------------------------------------------*/

/**
 * Lists the set of rubrics in a course
 * @author Gabriel Abrams
 * @method list
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to add the rubric to
 * @return {Promise.<Object[]>} list of Canvas Rubrics {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.list = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/rubrics`,
    method: 'GET',
  });
};
Rubric.list.action = 'list all the rubrics in a course';
Rubric.list.requiredParams = ['courseId'];

/**
 * Gets info on a specific rubric in a course
 * @author Gabriel Abrams
 * @method get
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to look up rubric in
 * @param {number} options.rubricId - Canvas rubric Id to look up
 * @param {boolean} [options.includeAssessments] - if true, assessments are
 *   included
 * @param {boolean} [options.includeGradedAssessments] - if true, graded
 *   assessments are included
 * @param {boolean} [options.includePeerAssessments] - if true, peer assessments
 *   are included
 * @param {boolean} [options.includeAssociations] - if true, associations
 *   are included
 * @param {boolean} [options.includeAssignmentAssociations] - if true,
 *   assignment associations are included
 * @param {boolean} [options.includeCourseAssociations] - if true, course
 *   associations are included
 * @param {boolean} [options.includeAccountAssociations] - if true, account
 *   associations are included
 * @param {string} [options.assessmentStyle=both omitted] - Allowed values:
 *   ['full','comments_only']
 *   (full = entire assessment, comments_only = only comment part of
 *   assessment). Only valid if including assessments
 * @return {Promise.<Object>} Canvas Rubric {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/courses/${options.courseId}/rubrics/${options.rubricId}`,
    method: 'GET',
    params: {
      include: utils.genIncludesList({
        assessments: options.includeAssessments,
        graded_assessments: options.includeGradedAssessments,
        peer_assessments: options.includePeerAssessments,
        associations: options.includeAssociations,
        assignment_associations: options.includeAssignmentAssociations,
        course_associations: options.includeCourseAssociations,
        account_associations: options.includeAccountAssociations,
      }),
      style: utils.includeIfTruthy(options.assessmentStyle),
    },
  });
};
Rubric.get.action = 'get info on a specific rubric in a course';
Rubric.get.requiredParams = ['courseId', 'rubricId'];

/**
 * Creates a free-form rubric for grading with free form comments enabled
 * @author Gabriel Abrams
 * @method createFreeFormRubric
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to add the rubric to
 * @param {string} [options.title=generated title] - the title of the
 *   rubric. If assignmentId is included, the default value for this is
 *   'Assignment Rubric', otherwise it is 'Unnamed Rubric'
 * @param {number} [options.assignmentId] - an assignment in the course to
 *   associate this rubric with. If excluded, the rubric is associated with the
 *   course as a whole
 * @param {boolean} [options.dontUseForGrading=false] - if true, then the rubric
 *   is not used for grading
 * @param {boolean} [options.hideScoreTotal=false] - if true, then the rubric
 *   total is hidden from students
 * @param {object[]} [options.rubricItems=[]] - a list of rubric items in the
 *   form { description, points, longDescription }. If points is not included,
 *   it is assumed to be 1 point.
 * @return {Promise.<Object>} Canvas Rubric {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.createFreeFormRubric = function (options) {
  const {
    courseId,
    rubricItems,
    dontUseForGrading,
    hideScoreTotal,
  } = options;

  // Choose association type
  const associationType = (
    options.assignmentId
      ? 'Assignment'
      : 'Course'
  );

  // Set title
  const title = (
    options.title
    || (
      options.assignmentId
        ? 'Assignment Rubric'
        : 'Unnamed Rubric'
    )
  );

  const params = {
    'rubric[title]': title,
    'rubric_association[use_for_grading]': !dontUseForGrading,
    'rubric_association[hide_score_total]': utils.isTruthy(hideScoreTotal),
    'rubric[free_form_criterion_comments]': 1,
    'rubric_association[association_type]': associationType,
    'rubric_association[association_id]':
      utils.includeIfTruthy(options.assignmentId),
    'rubric_association[purpose]': 'grading',
  };
  (rubricItems || []).forEach((rubricItem, i) => {
    params[`rubric[criteria][${i}][description]`] = (
      rubricItem.description
    );
    params[`rubric[criteria][${i}][points]`] = (
      rubricItem.points
    );
    params[`rubric[criteria][${i}][long_description]`] = (
      rubricItem.longDescription
    );
    params[`rubric[criteria][${i}][criterion_use_range]`] = false;
    params[`rubric[criteria][${i}][ratings][0][description]`] = (
      'Full Marks'
    );
    params[`rubric[criteria][${i}][ratings][0][points]`] = (
      rubricItem.points
    );
    params[`rubric[criteria][${i}][ratings][1][description]`] = (
      'No Marks'
    );
    params[`rubric[criteria][${i}][ratings][1][points]`] = 0;
  });
  return this.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${courseId}/rubrics`,
    method: 'POST',
  })
    .then((response) => {
      // Response is of form { rubric: <rubric object>, ... }
      // We just extract that rubric object
      const { rubric } = response;
      return Promise.resolve(rubric);
    });
};
Rubric.createFreeFormRubric.action = 'create a new free form rubric in a course';
Rubric.createFreeFormRubric.requiredParams = ['courseId'];

/**
 * Updates a free-form rubric for grading with free form comments enabled
 * @author Gabriel Abrams
 * @method updateFreeFormRubric
 * @memberof api.course.rubric
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.courseId - Canvas course Id to look in for the rubric
 * @param {number} options.rubricId - Canvas rubric Id of the rubric to update
 * @param {string} [options.title] - new title for the rubric
 * @param {number} [options.assignmentId] - an assignment in the course to
 *   associate this rubric with
 * @param {boolean} [options.dontUseForGrading] - if true, then the rubric
 *   is not used for grading
 * @param {boolean} [options.hideScoreTotal] - if true, then the rubric
 *   total is hidden from students
 * @param {object[]} [options.rubricItems] - a new list of rubric items in the
 *   form { description, points, longDescription }. If points is not included,
 *   it is assumed to be 1 point.
 * @return {Promise.<Object>} Canvas Rubric {@link https://canvas.instructure.com/doc/api/rubrics.html#Rubric}
 */
Rubric.updateFreeFormRubric = function (options) {
  const {
    courseId,
    rubricId,
    title,
    assignmentId,
    dontUseForGrading,
    hideScoreTotal,
    rubricItems,
  } = options;

  const params = {};

  // Change title
  if (title) {
    params['rubric[title]'] = title;
  }

  // Change association
  if (assignmentId) {
    params['rubric_association[association_type]'] = 'Assignment';
    params['rubric_association[association_id]'] = assignmentId;
  }

  // Change if this is for grading
  if (dontUseForGrading !== undefined) {
    params['rubric_association[use_for_grading]'] = !dontUseForGrading;
  }

  // Change hiding score total
  if (hideScoreTotal !== undefined) {
    params['rubric_association[hide_score_total]'] = (
      utils.isTruthy(hideScoreTotal)
    );
  }

  // Change rubric items
  if (rubricItems) {
    rubricItems.forEach((rubricItem, i) => {
      params[`rubric[criteria][${i}][description]`] = (
        rubricItem.description
      );
      params[`rubric[criteria][${i}][points]`] = (
        rubricItem.points
      );
      params[`rubric[criteria][${i}][long_description]`] = (
        rubricItem.longDescription
      );
      params[`rubric[criteria][${i}][criterion_use_range]`] = false;
      params[`rubric[criteria][${i}][ratings][0][description]`] = (
        'Full Marks'
      );
      params[`rubric[criteria][${i}][ratings][0][points]`] = (
        rubricItem.points
      );
      params[`rubric[criteria][${i}][ratings][1][description]`] = (
        'No Marks'
      );
      params[`rubric[criteria][${i}][ratings][1][points]`] = 0;
    });
  }

  return this.visitEndpoint({
    params,
    path: `${prefix.v1}/courses/${courseId}/rubrics/${rubricId}`,
    method: 'PUT',
  })
    .then((response) => {
      // Response is of form { rubric: <rubric object>, ... }
      // We just extract that rubric object
      const { rubric } = response;
      return Promise.resolve(rubric);
    });
};
Rubric.updateFreeFormRubric.action = 'update a free form rubric in a course';
Rubric.updateFreeFormRubric.requiredParams = ['courseId', 'rubricId'];

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Rubric;
