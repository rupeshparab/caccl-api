module.exports = [

  /**
   * Gets the list of enrollments in a course
   * @param {number} courseId - Canvas course Id to query
   * @param {string} types - list of enrollment types to include:
   *   ['student', 'ta', 'teacher', 'designer', 'observer']
   *   Defaults to all types.
   * @param {string} activeOnly - If true, only active enrollments included
   * @param {string} includeAvatar - If true, avatar_url is included
   * @param {string} includeGroups - If true, group_ids is included
   * @return list of Enrollments (see: https://canvas.instructure.com/doc/api/enrollments.html#Enrollment)
   */
  {
    name: 'listEnrollments',
    action: 'get enrollments from a course',
    run: (cg) => {
      const params = {};

      // Enrollment types
      if (cg.options.types) {
        params.type = cg.options.types.map((type) => {
          if (type.includes('Enrollment')) {
            return type;
          }
          return type.charAt(0).toUpperCase() + type.substr(1) + 'Enrollment';
        });
      }

      // Filter to only active
      if (cg.options.activeOnly) {
        params.state = ['active'];
      }

      // Include avatar
      if (cg.options.includeAvatar) {
        params.include = ['avatar_url'];
      }

      // Include groups
      if (cg.options.includeGroups) {
        if (!params.include) {
          params.include = [];
        }
        params.include.push('group_ids');
      }

      return cg.visitEndpoint({
        params,
        path: '/api/v1/courses/' + cg.options.courseId + '/enrollments',
        method: 'GET',
      });
    },
  },

  /**
   * Gets the list of students in a course
   * @param {number} courseId - Canvas course Id to query
   * @param {string} activeOnly - If true, only active enrollments included
   * @param {string} includeAvatar - If true, avatar_url is included
   * @param {string} includeGroups - If true, group_ids is included
   */
  {
    name: 'listStudents',
    action: 'get the list of students in a course',
    run: (cg) => {
      const newOptions = cg.options;
      newOptions.types = ['student'];
      return cg.self.getEnrollments(newOptions);
    },
  },

  /**
   * Gets the list of TAs and Teachers in a course
   * @param {number} courseId - Canvas course Id to query
   * @param {string} activeOnly - If true, only active enrollments included
   * @param {string} includeAvatar - If true, avatar_url is included
   * @param {string} includeGroups - If true, group_ids is included
   * @return list of Enrollments (see: https://canvas.instructure.com/doc/api/enrollments.html#Enrollment)
   */
  {
    name: 'listTeachingTeamMembers',
    action: 'get the list of TAs and Teachers in a course',
    run: (cg) => {
      const newOptions = cg.options;
      newOptions.types = ['ta', 'teacher'];
      return cg.self.getEnrollments(newOptions);
    },
  },

  /**
   * Gets the list of designers in a course
   * @param {number} courseId - Canvas course Id to query
   * @param {string} activeOnly - If true, only active enrollments included
   * @param {string} includeAvatar - If true, avatar_url is included
   * @param {string} includeGroups - If true, group_ids is included
   * @return list of Enrollments (see: https://canvas.instructure.com/doc/api/enrollments.html#Enrollment)
   */
  {
    name: 'listDesigners',
    action: 'get the list of designers in a course',
    run: (cg) => {
      const newOptions = cg.options;
      newOptions.types = ['designer'];
      return cg.self.getEnrollments(newOptions);
    },
  },

  /**
   * Gets the list of observers in a course
   * @param {number} courseId - Canvas course Id to query
   * @param {string} activeOnly - If true, only active enrollments included
   * @param {string} includeAvatar - If true, avatar_url is included
   * @param {string} includeGroups - If true, group_ids is included
   * @return list of Enrollments (see: https://canvas.instructure.com/doc/api/enrollments.html#Enrollment)
   */
  {
    name: 'listObserver',
    action: 'get the list of observers in a course',
    run: (cg) => {
      const newOptions = cg.options;
      newOptions.types = ['observer'];
      return cg.self.getEnrollments(newOptions);
    },
  },

];
