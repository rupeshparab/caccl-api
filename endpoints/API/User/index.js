const EndpointCategory = require('../../../classes/EndpointCategory');

const utils = require('../../common/utils');
const prefix = require('../../common/prefix');

// Import subcategories:
const Self = require('./Self');

class User extends EndpointCategory {
  constructor(config) {
    super(config, User);
  }
}

/*------------------------------------------------------------------------*/
/*                             Subcategories:                             */
/*------------------------------------------------------------------------*/

User.self = Self;

/*------------------------------------------------------------------------*/
/*                                Endpoints                               */
/*------------------------------------------------------------------------*/

/**
 * Lists the page views for a user
 * @author Gabriel Abrams
 * @method listPageViews
 * @memberof api.user
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.userId - Canvas user Id
 * @param {Date} [options.startDate] - the date to start the query for page
 *   views
 * @param {Date} [options.endDate] - the date to end the query for page views
 * @return {Promise.<Object[]>} List of Canvas PageView objects {@link https://canvas.instructure.com/doc/api/users.html#PageView}
 */
User.listPageViews = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/users/${options.userId}/page_views`,
    method: 'GET',
    params: {
      start_time: utils.includeIfDate(options.startDate),
      end_time: utils.includeIfDate(options.endDate),
    },
  });
};
User.listPageViews.action = 'list the page views for a user';
User.listPageViews.requiredParams = ['userId'];

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = User;
