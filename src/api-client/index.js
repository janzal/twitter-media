const request = require('request');
const stringify = require('./stringify');
const chunker = require('stream-chunker');
const stream = require('stream')

const DEFAULT_CHUNK_SIZE = 542288;

module.exports = class APIClient {
    constructor(oauth) {
        this.endpoint = 'https://upload.twitter.com/1.1/media/upload.json';
        this.oauth = oauth;
    }

    uploadImage(buffer) {
        return this._request({ formData: { media: buffer } });
    }

    uploadVideo(sourceStream, size) {
      sourceStream.pause();
      return new Promise((resolve, reject) => {
        let uploadJob
        this._initUpload(size).then((mediaID) => {
            const appender = new stream.Writable();
            let segmentIndex = 0;

            appender._write = (chunk, encoding, done) => {
              uploadJob = this._appendMedia(mediaID, chunk, segmentIndex).then(() => {
                  segmentIndex++;
                  done()
              }).catch(done)
            };

            appender.end = () => {
                uploadJob.then(_ => this._finalizeUpload(mediaID).then(resolve))
                    .catch(reject)
            }

            appender.on('error', err => {
                reject(err)
            })

            sourceStream.pipe(chunker(DEFAULT_CHUNK_SIZE, { flush: true })).pipe(appender)
            sourceStream.resume();

        }).catch(reject)
      })
    };

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

    _appendMedia(mediaID, buffer, segmentIndex) {
      const params = (part, segmentIndex) => ({
            formData: {
                command: 'APPEND',
                media_id: mediaID,
                segment_index: segmentIndex,
                media: part
            }
        });

        return this._request(params(buffer, segmentIndex, mediaID))
            .then(() => mediaID);
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
        const { state, check_after_secs: delayInSeconds, error } = processingInfo || {};

        var isComplete = new Set(['succeeded', 'failed']).has(state);
        var hasFailed = state === 'failed';

        if (!isComplete) {
            return new Promise((resolve) => {
                setTimeout(resolve, delayInSeconds * 1000);
            }).then(() => {
                return this._checkUploadStatus(mediaID);
            });
        } else if (hasFailed) {
            const reject_err = new Error(error.message || 'unknown error')
            reject_err.name = error.name
            return Promise.reject(reject_err);
        } else {
            return Promise.resolve(response);
        }
    }

    _request(params) {
        return new Promise((resolve, reject) => {
            const defaultParams = { url: this.endpoint, oauth: this.oauth, json: true, method: 'POST' };
            request(Object.assign(defaultParams, params), (error, response, body) => {
                const isOK = response.statusCode >= 200 && response.statusCode < 300;
                isOK ? resolve(body) : reject(new Error(`Error occurred fetching with params: ${stringify(params)}. Response: ${stringify(body)}`));
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
