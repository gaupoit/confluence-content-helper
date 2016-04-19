var toMarkdown = require('to-markdown'),
    fs = require('fs'),
    request = require('request'),
    Promise = require('promise'),
    defaultConfigFile = '../config/config.default.json',
    configs = require(defaultConfigFile),
    util = require('util');
/**
 * FileHelper helps to create folder and markdown file
 */
function FileHelper() {

    return {
        createSpaceFolder : function _createSpaceFilder(node, path) {
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
        createMakeDownFile: function _createMakeDownFile(folderPath, node, imageConfigs) {
            var self = this;
            var converter = {
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
                    var filePath = imageConfigs.publicDir + '/' + uri;
                    self.downloadImageFileFromConfluence(url, filePath);
                    return src ? '![' + alt + ']' + '(' + uri + ')' : '';
                }
            };
            var content = toMarkdown(node.body.view.value, {
                converters: [converter]
            });
            var fileName = node.title + ".md";
            var filePath = util.format("%s/%s", folderPath, fileName);
            try {
                fs.writeFileSync(filePath, content);
            } catch(ex) {
                console.log("Err", ex);
            }
        },
        downloadImageFileFromConfluence: function(url, dest) {
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
