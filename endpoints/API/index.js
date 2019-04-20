const EndpointCategory = require('../../classes/EndpointCategory');

// Import subcategories
const Account = require('./Account');
const Course = require('./Course');
const Other = require('./Other');
const User = require('./User');

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

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = API;
