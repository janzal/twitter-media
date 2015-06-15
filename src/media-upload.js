var request = require('request');
var async = require('async');

var MediaUpload = function (oauth_options) {
	if (typeof oauth_options !== 'object') {
		throw new Error('You have to provide oauth_options');
	}

	this.oauth_options = oauth_options;
};

MediaUpload.SUPPORTED_TYPES = ['image', 'video'];
MediaUpload.UPLOAD_ENDPOINT = 'https://upload.twitter.com/1.1/media/upload.json';
MediaUpload.CHUNK_SIZE = 1084576;

MediaUpload.prototype.uploadImageSet = function (images, callback) {
	throw new Error('Not implemented yet!');
};

MediaUpload.prototype.uploadMedia = function (type, media, callback) {
	var self = this;

	if (MediaUpload.SUPPORTED_TYPES.indexOf(type) === -1) {
		return callback(new Error('Unsupported media type ' + type));
	}

	if (!Buffer.isBuffer(media)) {
		return callback(new Error('Media has to be a Buffer instance'));
	}

	if (type === 'image') {
		this._uploadImage(media, callback);
	} else {
		this._uploadVideo(media, callback);
	}
};

MediaUpload.prototype._uploadImage = function (media, callback) {
	this._postRequest({
		formData: {
			media: media
		},
		url: MediaUpload.UPLOAD_ENDPOINT,
		json: true
	}, function (err, response, body) {
		if (err) {
			return callback(err);
		}
		if (response.statusCode >= 200 && response.statusCode < 300) {
			return callback(null, body.media_id_string, body);
		} else return callback(new Error('Error occured while uploading media'));
	});
};

MediaUpload.prototype._uploadVideo = function (media, callback) {
	var self = this;

	async.waterfall(
			[	this._initUpload.bind(this, media),
				this._appendMedia.bind(this),
				this._finalizeUpload.bind(this) ],
			callback);
};

MediaUpload.prototype._postRequest = function (params, callback) {
	params = params || {};
	params.oauth = params.oauth || this.oauth_options;

	request.post(params, function (err, response, body) {
		callback(err, response, body);
	});
};

MediaUpload.prototype._initUpload = function (media, callback) {
	if (!Buffer.isBuffer(media)) {
		return callback(new Error('Media has to be a Buffer instance'));
	}

	var formData = {
		command: 'INIT',
		media_type: 'video/mp4',
		total_bytes: media.length
	};

	this._postRequest({
		url: MediaUpload.UPLOAD_ENDPOINT,
		json: true,
		formData: formData
	}, function (err, response, body) {
		if (err) {
			return callback(err);
		}

		return callback(null, body.media_id_string, media);
	});
};

MediaUpload.prototype._splitMedia = function (media) {
	var parts = [];

	var partsCount = Math.ceil(media.length / MediaUpload.CHUNK_SIZE);

	// console.log('Parts count', partsCount);

	for (var partNr = 0; partNr < partsCount; partNr++) {
		var startPointer = partNr * MediaUpload.CHUNK_SIZE;
		var endPointer = (partNr === partsCount - 1)? undefined : (partNr + 1) * MediaUpload.CHUNK_SIZE;
		// console.log('Parts nr %d begins at %d, ends at %s', partNr, startPointer, endPointer);
		var part = media.slice(startPointer, endPointer);

		parts.push(part);
	}

	return parts;
};

MediaUpload.prototype._appendMedia = function (media_id, media, callback) {
	var self = this;

	if (!Buffer.isBuffer(media)) {
		return callback(new Error('Media has to be a Buffer instance'));
	}

	var parts = this._splitMedia(media);

	async.forEachOf(parts, function (part, index, callback) {
		var formData = {
			command: 'APPEND',
			media_id: media_id,
			segment_index: index,
			media: part
		};

		// console.log('Uploading segment %d of %d. Segment length %d', index, parts.length - 1, part.length);

		self._postRequest({
			url: MediaUpload.UPLOAD_ENDPOINT,
			json: true,
			formData: formData
		}, function (err, response, body) {
			if (err) {
				return callback(err);
			}

			// console.log('Segment %d uploaded', index);

			if (response.statusCode >= 200 && response.statusCode < 300) {
				return callback(null);
			} else return callback(new Error('Error occured while uploading media'));
		});
	}, function (err) {
		callback(err, media_id);
	});
};

MediaUpload.prototype._finalizeUpload = function (media_id, callback) {
	var formData = {
		command: 'FINALIZE',
		media_id: media_id,
	};

	this._postRequest({
		url: MediaUpload.UPLOAD_ENDPOINT,
		json: true,
		formData: formData
	}, function (err, response, body) {
		if (err) {
			return callback(err);
		}

		return callback(null, body.media_id_string, body);
	});
};

module.exports = MediaUpload;