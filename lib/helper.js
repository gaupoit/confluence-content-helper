/**
 * Utils function to help build confluence URL query
 * @type {[type]}
 */
var _ = require('lodash');
   

function Helper() {
    var confluenceConfig = require('../config/config.default.json');
    return {
        buildConfluenceQuery: function(data) {
            var query = '';
            if(_.isEmpty(data)) {
                return query;
            }
            if(data.title) {
                query = "?title=" + data.title;
            }
            if(data.expand) {
                if(query === '') {
                    query = "?expand=" + data.expand;
                } else {
                    query += "&expand=" + data.expand;
                }

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

module.exports = Helper();
