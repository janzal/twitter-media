var MediaUpload = require('../');
var fs = require('fs');
var oauthCreds = require('../config0.js');
var path = require('path');

var media = fs.readFileSync(path.join(__dirname, 'video2.mp4'));

var media_upload = new MediaUpload(oauthCreds);
media_upload.uploadMedia('video', media, console.log);
