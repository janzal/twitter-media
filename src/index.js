const request = require('request');
const ApiClient = require('./api-client');
const size = require('./api-client/remote-file-size')
const bufferToStream = require('./api-client/buffer-to-stream');
const SUPPORTED_TYPES = new Set(['image', 'video']);

module.exports = class MediaUpload {
    constructor(oauth) {
        this._client = new ApiClient(oauth);
    }

    uploadImageSet(images, cb) {
        if (!Array.isArray(images)) {
            const error = new Error('Images has to be array of image buffers');
            cb && cb(error);
            return Promise.reject(error);
        }

        return Promise.all(images.map((image) => this.uploadMedia('image', image))).then((results) => {
            cb && cb(null, results);
            return results;
        }).catch((error) => {
            cb && cb(error);
            return Promise.reject(error);
        });
    }

    uploadMedia(type, source, cb) {
        if (!SUPPORTED_TYPES.has(type)) {
            const error = new Error(`Unsupported media type. Expected one of: ${[...SUPPORTED_TYPES].join(', ')}`);
            cb && cb(error);
            return Promise.reject(error);
        }

        if (!Buffer.isBuffer(source) && typeof source !== 'string') {
            const error = new Error(`Source has to be a Buffer instance or url`);
            cb && cb(error);
            return Promise.reject(error);
        }

        let upload
        if (type === 'video') {
            if (typeof source === 'string') {
                upload = size(source).then(size =>
                    this._client.uploadVideo(request.get(source), size)
                )
            } else {
                upload = this._client.uploadVideo(bufferToStream(source), source.length)
            }
        } else {
            upload = Buffer.isBuffer(source) ? this._client.uploadImage(source) : this._client.uploadImage(request.get(source))
        }

        return upload.then((json) => {
            cb && cb(null, json.media_id_string, json);
            return json;
        }).catch((error) => {
            cb && cb(error);
            !cb && Promise.reject(error);
        });
    }
}
