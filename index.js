// var request = require('request');
// var fs = require('fs');

// var oauthCreds = {
// 	consumer_key: 'jVygzy1fE14dcKIZ5F3c20y6i'
// 	, consumer_secret: 'nbFIYvujGdPIp1rS6iXZlnFiz7tL82oGWTrS3y6iQMpB32S5hp'
// 	, token: '1710040506-YYRD9jLeHufuk0d67xUyHjfJ6jMQh1HF2UBDQwE'
// 	, token_secret: 'RtRLZaYBD1hNVl77TbJTOGtqjrlLq3KxptXHidUQuGNxF'
// };

// var media = fs.readFileSync('./video.mp4');

// // var formData = {
// // 	command: 'INIT',
// // 	media_type: 'video/mp4',
// // 	total_bytes: media.length
// // };
// // var formData = {
// // 	command: 'APPEND',
// // 	segment_index: 0,
// // 	media: media,
// // 	media_id: '608541579494715392'
// // };
// var formData = {
// 	command: 'FINALIZE',
// 	media_id: '608541579494715392'
// };

// request.post({
// 	oauth: oauthCreds,
// 	url: 'https://upload.twitter.com/1.1/media/upload.json',// + '?' + require('querystring').stringify(formData),
// 	json: true,
// 	formData: formData
// }, function (err, response, body) {
// 	console.log('Code:', response.statusCode);
// 	console.log('Message:', response.statusMessage);
// 	console.log('Body:', body);
// });

var MediaUpload = require('./src/media-upload.js');
var fs = require('fs');

var oauthCreds = {
	consumer_key: 'jVygzy1fE14dcKIZ5F3c20y6i'
	, consumer_secret: 'nbFIYvujGdPIp1rS6iXZlnFiz7tL82oGWTrS3y6iQMpB32S5hp'
	, token: '1710040506-YYRD9jLeHufuk0d67xUyHjfJ6jMQh1HF2UBDQwE'
	, token_secret: 'RtRLZaYBD1hNVl77TbJTOGtqjrlLq3KxptXHidUQuGNxF'
};

var media = fs.readFileSync('./video.mp4');

var media_upload = new MediaUpload(oauthCreds);
media_upload.uploadMedia('video', media, console.log);