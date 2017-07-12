var MediaUpload = require('../');
var fs = require('fs');
var oauthCreds = require('../config0.js');
var path = require('path');

var media = fs.readFileSync(path.join(__dirname, 'image.jpg'));

var media_upload = new MediaUpload(oauthCreds);
media_upload.uploadMedia('image', media, console.log);
