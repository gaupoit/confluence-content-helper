/**
 * Utils function to help build confluence URL query
 * @type {[type]}
 */
var _ = require('lodash');
   
var params = [
  'type',
  'spaceKey',
  'title',
  'status',
  'postingDay',
  'expand',
  'start',
  'limit',
];

function Helper(config) {
    var confluenceConfig = config;
    return {
        buildConfluenceQuery: function(data) {
            var applicableParams = _.pick(data, params);
            var query = '';
            var queries = [];
            if (!_.isEmpty(applicableParams)) {
                _.forEach(applicableParams, function(value, key) {
                    var queryString = key + '=' + value;
                    queries.push(queryString);
                });
            }

            if (queries.length > 0) {
                query = '?' + queries.join('&');
            }
            return query;
        },
        buildURI: function(opt) {
            var uri = confluenceConfig.baseUri;
            if(opt && opt.id) {
                uri += "/" + opt.id;
            }
            uri += this.buildConfluenceQuery(opt);
            return uri;
        },
        buildURL: function(opt) {
            var url = confluenceConfig.baseUrl;
            var uri = this.buildURI(opt);
            url += uri;
            return url;
        }
    };
}

module.exports = Helper;
