const ApiClient = require('./api-client');
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

    uploadMedia(type, media, cb) {
        if (!SUPPORTED_TYPES.has(type)) {
            const error = new Error(`Unsupported media type ${type}`);
            cb && cb(error);
            return Promise.reject(error);
        }

        if (!Buffer.isBuffer(media)) {
            const error = new Error(`Media has to be a Buffer instance`);
            cb && cb(error);
            return Promise.reject(error);
        }

        const upload = type === 'image' ? this._client.uploadImage(media) : this._client.uploadVideo(media);

        return upload.then((json) => {
            cb && cb(null, json.media_id_string, json);
            return json;
        }).catch((error) => {
            cb && cb(error);
            return Promise.reject(error);
        });
    }
}
