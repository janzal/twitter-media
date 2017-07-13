jest.mock('../api-client');

const TwitterMedia = require('../');
const path = require('path');
const fs = require('fs');

const image = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'image.jpg'));
const video = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'video.mp4'));

describe('Promise API', () => {
    it('Image upload', () => {
        const twitter = new TwitterMedia();
        return expect(twitter.uploadMedia('image', image)).resolves.toMatchSnapshot();
    });

    it('Image-set upload', () => {
        const twitter = new TwitterMedia();
        return expect(twitter.uploadImageSet([image, image, image])).resolves.toMatchSnapshot();
    });

    it('Video upload', () => {
        const twitter = new TwitterMedia();
        return expect(twitter.uploadMedia('video', video)).resolves.toMatchSnapshot();
    });
});

describe('Callback API', () => {
    it('Image upload', () => {
        const twitter = new TwitterMedia();

        expect.assertions(1);
        twitter.uploadMedia('image', image, (error, mediaID, body) => {
            expect(body).toMatchSnapshot();
        });
    });

    it('Image-set upload', () => {
        const twitter = new TwitterMedia();

        expect.assertions(1);
        twitter.uploadImageSet([image, image, image], (error, body) => {
            expect(body).toMatchSnapshot();
        });
    });

    it('Video upload', () => {
        const twitter = new TwitterMedia();

        expect.assertions(1);
        twitter.uploadMedia('video', video, (error, mediaID, body) => {
            expect(body).toMatchSnapshot();
        });
    });
});
