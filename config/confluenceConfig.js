
'use strict'

var config = {

	//The base URL of your Confluence 
    'baseUrl': "http://confluence.abc.com/",

    //The base URI of Confluence api
    "baseUri": "/rest/api/content",

    //The path of data to store the markdown pages
    "dataPath": "/data",

    //The username of your Confluence account
    "username": "your-user-name",

    //The password of your Confluence password
    "password": "your-password",

    //The application's public directory 
    "publicDir": "public",

    //The image path to store images relatively to public directory
    "imagePath": "images",

    //The image path to show in md files
    "imageMdPath": "/images-path-in-md-file"
    
};

module.exports = config;

