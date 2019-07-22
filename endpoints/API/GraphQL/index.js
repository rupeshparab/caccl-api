const CACCLError = require('caccl-error');
const Query = require('graphql-query-builder');

// Import other local dependencies
const EndpointCategory = require('../../../classes/EndpointCategory');
const errorCodes = require('../../../errorCodes');

// Constants
const API_PATH = '/api/graphql';

class GraphQL extends EndpointCategory {
  constructor(config) {
    super(config, GraphQL);
  }
}

/**
 * Sends a generic GraphQL query
 * @author Gabriel Abrams
 * @method listSubmissions
 * @memberof api.ql.query
 * @instance
 * @param {object} options - object containing all arguments
 * @param {string} query - the query to send
 * @return {object} results
 */

GraphQL.query = function (options) {
  const { query } = options;

  return this.visitEndpoint({
    path: API_PATH,
    method: 'POST',
    params: {
      query,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      try {
        return response.data;
      } catch (err) {
        throw new CACCLError({
          message: 'Canvas\' response did not contain the structure we expected.',
          code: errorCodes.invalidSubmissionStructure,
        });
      }
    });
};
GraphQL.query.action = 'send a GraphQL-based request to Canvas';
GraphQL.query.requiredParams = ['query'];

/**
 * Lists the quizzes in a course
 * @author Gabriel Abrams
 * @method listSubmissions
 * @memberof api.ql.listSubmissions
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.assignmentId - the Canvas assignment Id
 * @param {boolean} [options.includeId] - if true, the submission id
 *   is included
 * @param {boolean} [options.includeAssignment] - if true, the assignment is
 *   included
 * @param {boolean} [options.includeAttachments] - if true, the attachments are
 *   included
 * @param {boolean} [options.includeAttempt] - if true, the number of attempts
 *   is included
 * @param {object} [options.comments] - the object holding all the comments
 *   properties to include
 * @param {boolean} [options.comments.includeId] - if true, the comment
 *   ids are included
 * @param {boolean} [options.comments.includeAttachments] - if true, the comment
 *   attachments are included
 * @param {boolean} [options.comments.includeAuthor] - if true, the comment
 *   authors are included
 * @param {boolean} [options.comments.includeText] - if true, the comment
 *   text is included
 * @param {boolean} [options.comments.includeCreatedAt] - if true, the comment
 *   createAt dates are included
 * @param {boolean} [options.comments.includeUpdatedAt] - if true, the comment
 *   updatedAt dates are included
 * @param {boolean} [options.includeCreatedAt] - if true, the createdAt date is
 *   included
 * @param {boolean} [options.includeDeductedPoints] - if true, the number of
 *   deducted points is included
 * @param {boolean} [options.includeEnteredGrade] - if true, the entered grade
 *   is included
 * @param {boolean} [options.includeEnteredScore] - if true, the entered score
 *   is included
 * @param {boolean} [options.includeExcused] - if true, whether or not the sub
 *   is excused is included
 * @param {boolean} [options.includeGrade] - if true, the grade
 *   is included
 * @param {boolean} [options.includeGradedAt] - if true, the gradedAt date
 *   is included
 * @param {boolean} [options.includeGradingStatus] - if true, the grading status
 *   is included
 * @param {boolean} [options.includeLatePolicyStatus] - if true, the late policy
 *   status is included
 * @param {boolean} [options.includePostedAt] - if true, the postedAt date
 *   is included
 * @param {boolean} [options.includeScore] - if true, the score
 *   is included
 * @param {boolean} [options.includeState] - if true, the state
 *   is included
 * @param {boolean} [options.includeEnteredGrade] - if true, the entered grade
 *   is included
 * @param {boolean} [options.includeSubmissionStatus] - if true, the submission
 *   status is included
 * @param {boolean} [options.includeSubmittedAt] - if true, the submittedAt date
 *   is included
 * @param {boolean} [options.includeUpdatedAt] - if true, the updatedAt date
 *   is included
 * @param {object} [options.user] - an object including all the includes for
 *   the user is included
 * @param {boolean} [options.user.includeId] - if true, the user's id
 *   is included
 * @param {boolean} [options.user.includeAvatarURL] - if true, the user's image
 *   url is included
 * @param {boolean} [options.user.includeCreatedAt] - if true, the user's
 *   createdAt date is included
 * @param {boolean} [options.user.includeEmail] - if true, the user's email
 *   is included
 * @param {boolean} [options.user.includeEnrollments] - if true, the user's
 *   enrollments is included
 * @param {boolean} [options.user.includeName] - if true, the user's name
 *   is included
 * @param {boolean} [options.user.includeShortName] - if true, the user's short
 *   name is included
 * @param {boolean} [options.user.includeSortableName] - if true, the user's
 *   sortableName is included
 * @param {boolean} [options.user.includeSummaryAnalytics] - if true, the user's
 *   summaryAnalytics is included
 * @param {boolean} [options.user.includeUpdatedAt] - if true, the user's
 *   updatedAt date is included
 * @return {Promise.<Object[]>} list of Canvas Quizzes {@link https://canvas.instructure.com/doc/api/quizzes.html#Quiz}
 */
GraphQL.listSubmissions = function (options) {
  // Build the GraphQL query
  const assignment = new Query('assignment', { id: options.assignmentId });
  const submissions = new Query('submissionsConnection');
  const nodes = new Query('nodes');
  const submissionPropsToInclude = [];
  if (options.includeId) {
    submissionPropsToInclude.push('_id');
  }
  if (options.includeAssignment) {
    submissionPropsToInclude.push('assignment');
  }
  if (options.includeAttachments) {
    submissionPropsToInclude.push('attachments');
  }
  if (options.includeAttempt) {
    submissionPropsToInclude.push('attempt');
  }
  if (options.comments) {
    const comments = new Query('commentsConnection');
    const commentNode = new Query('nodes');
    const commentPropsToInclude = [];
    if (options.comments.includeId) {
      commentPropsToInclude.push('_id');
    }
    if (options.comments.includeAttachments) {
      commentPropsToInclude.push('attachments');
    }
    if (options.comments.includeAuthor) {
      commentPropsToInclude.push('author');
    }
    if (options.comments.includeComment) {
      commentPropsToInclude.push('comment');
    }
    if (options.comments.includeCreatedAt) {
      commentPropsToInclude.push('createAt');
    }
    if (options.comments.includeUpdatedAt) {
      commentPropsToInclude.push('updatedAt');
    }
    commentNode.find(...commentPropsToInclude);
    comments.find(commentNode);
    submissionPropsToInclude.push(comments);
  }
  if (options.includeCreatedAt) {
    submissionPropsToInclude.push('createdAt');
  }
  if (options.includeDeductedPoints) {
    submissionPropsToInclude.push('deductedPoints');
  }
  if (options.includeEnteredGrade) {
    submissionPropsToInclude.push('enteredGrade');
  }
  if (options.includeEnteredScore) {
    submissionPropsToInclude.push('enteredScore');
  }
  if (options.includeExcused) {
    submissionPropsToInclude.push('excused');
  }
  if (options.includeGrade) {
    submissionPropsToInclude.push('grade');
  }
  if (options.includeGradedAt) {
    submissionPropsToInclude.push('gradedAt');
  }
  if (options.includeGradingStatus) {
    submissionPropsToInclude.push('gradingStatus');
  }
  if (options.includeLatePolicyStatus) {
    submissionPropsToInclude.push('latePolicyStatus');
  }
  if (options.includePostedAt) {
    submissionPropsToInclude.push('postedAt');
  }
  if (options.includeScore) {
    submissionPropsToInclude.push('score');
  }
  if (options.includeState) {
    submissionPropsToInclude.push('state');
  }
  if (options.includeEnteredGrade) {
    submissionPropsToInclude.push('enteredGrade');
  }
  if (options.includeSubmissionStatus) {
    submissionPropsToInclude.push('submissionStatus');
  }
  if (options.includeSubmittedAt) {
    submissionPropsToInclude.push('submittedAt');
  }
  if (options.includeUpdatedAt) {
    submissionPropsToInclude.push('updatedAt');
  }
  if (options.user) {
    const user = new Query('user');
    const userPropsToInclude = [];
    if (options.user.includeId) {
      userPropsToInclude.push('_id');
    }
    if (options.user.includeAvatarURL) {
      userPropsToInclude.push('avatarURL');
    }
    if (options.user.includeCreatedAt) {
      userPropsToInclude.push('createdAt');
    }
    if (options.user.includeEmail) {
      userPropsToInclude.push('email');
    }
    if (options.user.includeEnrollments) {
      userPropsToInclude.push('enrollments');
    }
    if (options.user.includeName) {
      userPropsToInclude.push('name');
    }
    if (options.user.includeShortName) {
      userPropsToInclude.push('shortName');
    }
    if (options.user.includeSortableName) {
      userPropsToInclude.push('sortableName');
    }
    if (options.user.includeSummaryAnalytics) {
      userPropsToInclude.push('summaryAnalytics');
    }
    if (options.user.includeUpdatedAt) {
      userPropsToInclude.push('updatedAt');
    }
    user.find(...userPropsToInclude);
    submissionPropsToInclude.push(user);
  }
  nodes.find(...submissionPropsToInclude);
  submissions.find(nodes);
  assignment.find(submissions);

  return this.visitEndpoint({
    path: API_PATH,
    method: 'POST',
    params: {
      query: `{${assignment.toString()}}`,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      try {
        return response.data.assignment.submissionsConnection.nodes;
      } catch (err) {
        throw new CACCLError({
          message: 'Canvas\' response did not contain the structure we expected.',
          code: errorCodes.invalidSubmissionStructure,
        });
      }
    });
};
GraphQL.listSubmissions.action = 'send a GraphQL-based submission list request to Canvas';
GraphQL.listSubmissions.requiredParams = ['courseId', 'assignmentId'];

module.exports = GraphQL;
