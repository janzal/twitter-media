var MediaUpload = require('../');
var fs = require('fs');
var oauthCreds = require('../config0.js');

var media = fs.readFileSync('./video.mp4');

var media_upload = new MediaUpload(oauthCreds);
media_upload.uploadMedia('video', media, console.log);
