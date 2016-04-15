var toMarkdown = require('to-markdown'),
    fs = require('fs'),
    request = require('request'),
    configs = require('../config/confluenceConfig'),
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
                console.log("Err", ex);
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
                    var filePath = imageConfigs.publicDir + uri;
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
        }
    }
}

module.exports = FileHelper();
