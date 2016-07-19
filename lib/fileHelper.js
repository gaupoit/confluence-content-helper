var toMarkdown = require('to-markdown'),
    fs = require('fs'),
    request = require('request'),
    Promise = require('promise'),
    defaultConfigFile = __dirname + '/../config/config.default.json',
    util = require('util');

/**
 * FileHelper helps to create folder and markdown file
 */
function FileHelper() {

    return {
        createSpaceFolder : function _createSpaceFilder(node, path) {
            var configs = require(defaultConfigFile);
            if(path) {
                var folderName = util.format("%s", node.title);
            } else {
                var folderName = util.format("%s(%s)", node.space.key, node.space.name);
            }
            var dataPath = path && path !== '' ? path : configs.dataPath;
            var folderPath = util.format("%s/%s", dataPath, folderName);
            try {
                fs.mkdirSync(folderPath);
            } catch(ex) {
                if(ex.code !== 'EEXIST') {
                    console.log("Err", ex);
                }
            }
            return folderPath;
        },
        createMakeDownFile: function _createMakeDownFile(folderPath, parentNode, imageConfigs) {
            var self = this;
            var fileName = parentNode.title + ".md";
            var filePath = util.format("%s/%s", folderPath, fileName);
            const CONFLUENCE_URL_PATH = '/display/UI/';
            const PAGE_ID_PATH = 'pageId=';
            var converters = [{
                filter: 'img',
                replacement: function(content, node) {
                    var baseUrl = node.getAttribute('data-base-url') || '';
                    var alt = node.alt || '';
                    var src = node.getAttribute('src') || '';
                    var title = node.title || '';
                    var fileName = node.getAttribute('data-linked-resource-default-alias');
                    var titlePart = title ? ' "' + title + '"' : '';
                    var url = baseUrl + src + titlePart;
                    var uri = imageConfigs.imagePath + '/' + fileName;
                    var filePath = imageConfigs.publicDir + uri;
                    var imagePath = imageConfigs.realImagePath + '/' + fileName;
                    self.downloadImageFileFromConfluence(url, filePath);
                    return src ? '![' + alt + ']' + '(' + imagePath + ')' : '';
                }
            }, {
                filter: function(node) {
                    return node.nodeName === 'A' && node.getAttribute('href');
                },
                replacement: function(content, node) {
                    var titlePart = node.title ? ' "' + node.title + '"' : '';
                    var href = node.getAttribute('href');
                    //case 1: if url contains /display/UI/
                    const Confluence = require('./Confluence');
                    var config = self.loadConfigration();
                    var confluence = Confluence(config);
                    if(href.indexOf(CONFLUENCE_URL_PATH) > -1) {
                        titlePart = href.replace(CONFLUENCE_URL_PATH, '').trim();
                        var titleParent = parentNode.title;
                        var response = confluence.getcontentSync({
                            'title': titlePart,
                            'expand': 'ancestors'
                        });
                        var body = JSON.parse(response.body);
                        if(body.results && body.results.length > 0) {
                            body = body.results[0];
                            if(body.ancestors && body.ancestors.length > 0) {
                                var lastAncestor = body.ancestors[body.ancestors.length - 1];
                                titleParent = lastAncestor.title;
                            }
                        }
                        href = href
                        .replace(CONFLUENCE_URL_PATH, '/kb/' + titleParent + '/')
                        .replace(/\+/g, ' ')
                        .trim();
                    //case 2: if url contains 123pageId={id}
                    } else if(href.indexOf(PAGE_ID_PATH) > -1) {
                        pageIdIndex = href.indexOf(PAGE_ID_PATH);
                        if(pageIdIndex > -1) {
                            pageIdIndex = href.substr(pageIdIndex + PAGE_ID_PATH.length, href.length - 1);
                        }
                        var response = confluence.getcontentSync({
                            pageId: pageIdIndex,
                            expand: 'ancestors'
                        });
                        var body = JSON.parse(response.body);
                        var titleParent = parentNode.title;
                        if(body.ancestors && body.ancestors.length > 0) {
                            var lastAncestor = body.ancestors[body.ancestors.length - 1];
                            titleParent = lastAncestor.title;
                        }
                        href = '/kb/' + titleParent + '/' + body.title;
                        href = href.replace(/\(/g, "%28");
                        href = href.replace(/\)/g, "%29");

                    }
                    var result = '[' + content + '](' + href + ')';
                    return result;
                }
            }];
            var content = toMarkdown(parentNode.body.view.value, {
                converters: converters
            });
            try {
                fs.writeFileSync(filePath, content);
            } catch(ex) {
                console.log("Err", ex);
            }
        },
        downloadImageFileFromConfluence: function(url, dest) {
            var configs = require(defaultConfigFile);
            request({
                'method': 'GET',
                'url': url,
                'auth': {
                    "username": configs.username,
                    "password": configs.password
                }
            })
            .on('err', function(err){
                console.log("Download image error ", url, err);
            })
            .pipe(fs.createWriteStream(dest));
        },
        saveConfiguration: function(configs) {
            var data = JSON.stringify(configs, null, '\t');
            return new Promise(function(resolve, reject) {
                fs.writeFile(defaultConfigFile, data, function(err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });    
            });
        },
        loadConfigration: function() {
            var data = fs.readFileSync(defaultConfigFile);
            var myObj;
            try {
                myObj = JSON.parse(data);
            } catch (err) {
                console.log("Configration is empty.")
            }
            return myObj;
        },
        checkDefaultConfigFileExists: function() {
            return new Promise((resolve, reject) => {
                fs.access(defaultConfigFile, fs.R_OK | fs.W_OK, (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve();
                });    
            });
            
        }
    }
}

module.exports = FileHelper();
