var MediaUpload = require('../');
var fs = require('fs');
var oauthCreds = require('../config0.js');

var media = fs.readFileSync('./image.jpg');

var media_upload = new MediaUpload(oauthCreds);
media_upload.uploadMedia('image', media, console.log);
