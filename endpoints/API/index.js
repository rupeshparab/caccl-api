const EndpointCategory = require('../../classes/EndpointCategory');

// Import subcategories
const Account = require('./Account');
const Course = require('./Course');
const Other = require('./Other');
const User = require('./User');
const GraphQL = require('./GraphQL');

class API extends EndpointCategory {
  constructor(config) {
    super(config, API);
  }
}

/*------------------------------------------------------------------------*/
/*                             Subcategories:                             */
/*------------------------------------------------------------------------*/

/* @module course */
API.account = Account;
API.course = Course;
API.other = Other;
API.user = User;
API.ql = GraphQL;

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = API;
