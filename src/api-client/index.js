const request = require('request');
const splitBuffer = require('./split-buffer');

const DEFAULT_CHUNK_SIZE = 1084576;

module.exports = class APIClient {
    constructor(oauth) {
        this.endpoint = 'https://upload.twitter.com/1.1/media/upload.json';
        this.oauth = oauth;
    }

    uploadImage(buffer) {
        return this._request({ formData: { media: buffer } });
    }

    uploadVideo(buffer, chunkSize) {
        return Promise.resolve(buffer.length).then((size) => {
            return this._initUpload(size);
        }).then((mediaID) => {
            return this._appendMedia(mediaID, buffer, chunkSize);
        }).then((mediaID) => {
            return this._finalizeUpload(mediaID);
        });
    }

    _initUpload(size) {
        const params = {
            formData: {
                command: 'INIT',
                media_type: 'video/mp4',
                media_category: 'tweet_video',
                total_bytes: size
            }
        };

        return this._request(params).then((json) => json.media_id_string);
    }

    _appendMedia(mediaID, buffer, chunkSize = DEFAULT_CHUNK_SIZE) {
        const params = (part, segmentIndex) => ({
            formData: {
                command: 'APPEND',
                media_id: mediaID,
                segment_index: segmentIndex,
                media: part
            }
        });

        const parts = splitBuffer(buffer, chunkSize);
        const uploads = parts.map((part, index) => this._request(params(part, index)));
        return Promise.all(uploads).then(() => mediaID);
    }

    _finalizeUpload(mediaID) {
        const params = {
            formData: {
                command: 'FINALIZE',
                media_id: mediaID
            }
        };

        return this._request(params).then((json) => this._ensureCompleteness(json));
    }

    _checkUploadStatus(mediaID) {
        const params = {
            method: 'GET',
            qs: {
                command: 'STATUS',
                media_id: mediaID
            }
        };

        return this._request(params).then((json) => this._ensureCompleteness(json));
    }

    _ensureCompleteness(response) {
        const { media_id_string: mediaID, processing_info: processingInfo } = response || {};
        const { state, check_after_secs: delayInSeconds } = processingInfo || {};

        var isComplete = new Set(['succeeded', 'failed']).has(state);
        var hasFailed = state === 'failed';

        if (!isComplete) {
            return new Promise((resolve) => {
                setTimeout(resolve, delayInSeconds * 1000);
            }).then(() => {
                return this._checkUploadStatus(mediaID);
            });
        } else if (hasFailed) {
            return Promise.reject(response);
        } else {
            return Promise.resolve(response);
        }
    }

    _request(params) {
        return new Promise((resolve, reject) => {
            const defaultParams = { url: this.endpoint, oauth: this.oauth, json: true, method: 'POST' };
            request(Object.assign(defaultParams, params), (error, response, body) => {
                const isOK = response.statusCode >= 200 && response.statusCode < 300;
                isOK ? resolve(body) : reject(new Error(`Error occurred fetching with params: ${JSON.stringify(params)}. Response: ${JSON.stringify(response)}`));
            });
        }).then((response) => {
            const error = extractError(response);
            return error ? Promise.reject(error) : response;
        });
    }
};

function extractError(response) {
    const { error, errors = [] } = response || {};

    if (error) {
        return new Error(error);
    }

    if (errors.length > 0) {
        return new Error(errors[0]);
    }
}
