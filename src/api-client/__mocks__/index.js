module.exports = class MockApiClient {
    constructor() {
        this._nextID = 0;
    }

    getMediaID() {
        this._nextID += 1;
        return this._nextID;
    }

    uploadImage(buffer) {
        const id = this.getMediaID();
        return Promise.resolve({
            media_id: id,
            media_id_string: String(id),
            size: buffer.length,
            expires_after_secs: 86400,
            image: {
                image_type: 'image/jpeg',
                w: 0,
                h: 0
            }
        });
    }

    uploadVideo(sourceStream, size) {
        const id = this.getMediaID();
        return Promise.resolve({
            media_id: id,
            media_id_string: String(id),
            size: size,
            expires_after_secs: 86399,
            video: {
                video_type: 'video/mp4'
            },
            processing_info: {
                state: 'succeeded',
                progress_percent: 100
            }
        });
    }
}
