/**
 * Node.js wrapper for Allassian's Confluence Rest API.
 * Please take a look at https://developer.atlassian.com/confdev/confluence-rest-api
 * Creator: gaupoit
 */
/*jslint node: true */
// 'use strict';
var Promise = require('promise'),
    request = require('request'),
    util = require('util'),
    Helper = require('./helper'),
    _ = require('lodash'),
    Queue = require('promise-queue'),
    fileHelper = require('./fileHelper');
/**
 * [Confluence description]
 * @param {baseUrl: '', username: '', password: ''} configs [description]
 */

function Confluence(configs) {
    var queue = new Queue(1, Infinity);
    var helper = new Helper(configs);
    return {
        getContent: function(opt) {
            var self = this;
            var p = new Promise(function(resolve, reject) {
                var url = helper.buildURL(opt, configs);
                request({
                    'method': 'GET',
                    'url': url,
                    'auth': {
                        'user': configs.username,
                        'password': configs.password
                    }
                }, function(err, res, result) {
                    if (!err && res.statusCode === 200) {
                        var resultObjectType = Object.prototype.toString.call(result);
                        if (resultObjectType !== "[object Object]") {
                            try {
                                result = JSON.parse(result);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                        var data = self.getResult(result);
                        var imageConfigs = {
                            "publicDir": configs.publicDir,
                            "imagePath": configs.imagePath
                        };
                        if(data && self.haveChildContent(data)) {
                            if(opt.isRoot) {
                                var folderPath = fileHelper.createSpaceFolder(data, configs.dataPath);
                            } else {
                                var folderPath = fileHelper.createSpaceFolder(data, opt.parentFolder);
                            }
                            fileHelper.createMakeDownFile(folderPath, data, imageConfigs);
                            var childrens = data.children.page.results;
                            self.getChildrentsContent(childrens, folderPath, resolve, reject);
                        } else {
                            fileHelper.createMakeDownFile(opt.parentFolder, data, imageConfigs);
                            resolve(result);
                        }
                    }
                    reject(err);
                });
            });
            queue.add(p);
            return queue;
        },
        haveChildContent: function(parent) {
            return parent.children.page.results.length !== 0;
        },
        getResult: function(responseObj) {
            if(responseObj && responseObj.results) {
                return responseObj.results[0];
            } else if(responseObj) {
                return responseObj;
            } else {
                return null;
            }
        },
        getChildrentsContent: function(childrens, parentFolder, resolve, reject) {
            var self = this;
            for(var i = 0, len = childrens.length; i < len; i++) {
                self.getContent({
                    parentFolder: parentFolder,
                    id: childrens[i].id,
                    expand: 'body.view,history,children.page.results.body.view,ancestors,descendants.page,space'
                });
            }
        }
    };
}
module.exports = Confluence;
