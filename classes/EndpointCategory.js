/**
 * Class that handles a category of endpoints
 * @module classes/EndpointCategory
 * @see module: classes/EndpointCategory
 */

const CACCLError = require('caccl-error');

// Endpoint-related helpers
const instantiateEndpoint = require('./instantiateEndpoint');
const errorCodes = require('../errorCodes');

const MemoryCache = require('./caches/MemoryCache');
const SessionCache = require('./caches/SessionCache');

/*------------------------------------------------------------------------*/
/*                    Helper that pre-processes config                    */
/*------------------------------------------------------------------------*/

/** A category of endpoints */
class EndpointCategory {
  /**
   * Creates an EndpointCategory
   * @author Gabe Abrams
   * @param {function} [config.visitEndpoint=instance made by genVisitEndpoint]
   *   - An instance of a visitEndpoint function generated by
   *   classes/endpoint/genEndpointFunction
   * @param {number} [config.numRetries=3] - Only valid if visitEndpoint
   *   is excluded. Used when creating a new visitEndpoint function (equals the
   *   default number of times to retry failed a request). This may be
   *   overridden in any request by including a numRetries option
   * @param {number} [config.itemsPerPage=100] - Only valid if
   *   visitEndpoint is excluded. Used when creating a new visitEndpoint
   *   function (equals the default number of items to request from Canvas).
   *   This may be overridden in any request by including an itemsPerPage option
   * @param {string} [config.canvasHost=canvas.instructure.com] - Only valid if
   *   visitEndpoint is excluded. Used when creating a new visitEndpoint
   *   function (equals the default Canvas hostname to use). This may be
   *   overridden in any request by including a host option
   * @param {string} [config.apiPathPrefix] - Only valid if visitEndpoint is
   *   excluded. Used when creating a new visitEndpoint function (this string
   *   prefix is prepended to all paths before sending requests)
   * @param {string} [config.accessToken] - Only valid if visitEndpoint is
   *   excluded. Used when creating a new visitEndpoint function (this access
   *   token will be added to all requests). This may be overridden in any
   *   request by including an access_token query parameter
   * @param {function} [config.sendRequest=defaultSendRequest] - Only valid if
   *   visitEndpoint is excluded. Used when creating a new visitEndpoint
   *   function (this function is used to send https requests to Canvas)
   * @param {object} [config.cache=null] - A cache instance to use. If excluded,
   *   caching is turned off
   * @param {string} [config.cacheType=none] - Only valid if cache is excluded.
   *   Used when creating a new cache. If cacheType is not included, caching is
   *   turned off. If cacheType is 'memory', a new MemoryCache is created. If
   *   cacheType is 'session', you must also include config.req and we'll create
   *   a new SessionCache. To include your own custom cache, include it as
   *   config.cache and do not define cacheType
   * @param {object} [config.api=this] - Top level EndpointCategory instance
   *   of which this EndpointCategory instance is a descendent
   * @param {function} [uncache=create new uncache function] - A function that
   *   takes paths and a response object, uncaches those paths, then resolves
   *   to the response object
   * @param {string} [config.authenticityToken] - An authenticity token
   *   to add to all requests no matter what (cannot be overridden)
   */
  constructor(oldConfig = {}, Subclass) {
    const config = this._preProcessParams(oldConfig);

    // Turn each endpointCoreFunction (defined as a static function in the
    // child) into a fully working endpoint function AND initialize
    // sub-categories
    Object.keys(Subclass).forEach((prop) => {
      if (Subclass[prop].prototype instanceof EndpointCategory) {
        // This is a sub-category
        this[prop] = new Subclass[prop](config);
      } else {
        // This is an endpointCoreFunction
        const endpointCoreFunction = Subclass[prop];

        // Extract action from function props
        const action = (
          endpointCoreFunction.action
          || `perform an unnamed ${prop} task`
        );

        console.log('EndpointCategory config', config)

        // Instantiate the endpoint
        this[prop] = instantiateEndpoint({
          action,
          requiredParams: endpointCoreFunction.requiredParams,
          endpointCoreFunction: Subclass[prop],
          cache: config.cache,
          uncache: config.uncache,
          api: config.api,
          authenticityToken: config.authenticityToken,
          defaults: {
            accessToken: config.accessToken,
            itemsPerPage: config.itemsPerPage,
            apiPathPrefix: config.apiPathPrefix,
            numRetries: config.numRetries,
            sendRequest: config.sendRequest,
            canvasHost: config.canvasHost,
            basePath: config.basePath,
          },
        });
      }
    });
  }

  /**
   * Function that should be overwritten. This function should never run.
   */
  visitEndpoint() {
    // visitEndpoint is re-initialized each time an endpoint is called
    // see: classes/instantiateEndpoint/index.js

    throw new Error(`The visitEndpoint function cannot be called directly as a method of the ${this.constructor.name} class`);
  }

  /**
   * Pre-process the config object, initializing api, cache, and uncache
   *   function if needed
   * @param {object} [oldConfig] - the original config object
   * @return {object} new, initialized config object
   */
  _preProcessParams(oldConfig) {
    const config = oldConfig;

    // Initialize top-level api reference
    if (!config.api) {
      config.api = this;
    }

    // Initialize the cache
    if (!config.cache) {
      if (config.cacheType === 'memory') {
        config.cache = new MemoryCache();
      } else if (config.cacheType === 'session' && config.req) {
        config.cache = new SessionCache(config.req);
      } else if (config.cacheType) {
        // Invalid cache type
        throw new CACCLError({
          message: 'Canvas API was initialized improperly: cacheType must be "memory" or "session". If "session", req must be included.',
          code: errorCodes.invalid_cache,
        });
      }
    }

    // Initialize the uncache function
    if (!config.uncache) {
      // Create an uncache function to pass to endpoints
      if (config.cache) {
        // Create uncache function that changes the cache
        config.uncache = (paths, response) => {
          return config.cache
            .getAllPaths()
            .then((cachedPaths) => {
              // Find paths that need to be uncached
              const pathsToUncache = [];
              paths.forEach((path) => {
                if (path.endsWith('*')) {
                  // This is a prefix-based path. Loop to find paths that match.
                  const prefix = path.split('*')[0];
                  cachedPaths.forEach((cachedPath) => {
                    if (cachedPath.startsWith(prefix)) {
                      // Prefix matches! Uncache this!
                      pathsToUncache.push(cachedPath);
                    }
                  });
                } else {
                  // This is a normal path. Just add it.
                  pathsToUncache.push(path);
                }
              });

              // Uncache
              return config.cache.deletePaths(pathsToUncache);
            })
            .then(() => {
              // Finally resolve with response
              return Promise.resolve(response);
            });
        };
      } else {
        // No cache. Return dummy function that does nothing
        config.uncache = (_, response) => {
          return Promise.resolve(response);
        };
      }
    }

    return config;
  }
}

module.exports = EndpointCategory;
