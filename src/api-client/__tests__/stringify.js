const path = require('path');
const fs = require('fs');
const stringify = require('../stringify');

const image = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'assets', 'image.jpg'));

test('stringify an object containing a buffer', () => {
    const actual = stringify({
        media: image
    });

    expect(actual).toMatchSnapshot();
});

test('stringify an object containing a buffer in a nested value', () => {
    const actual = stringify({
        method: 'GET',
        formData: {
            media: image,
            media_id: '123'
        }
    });

    expect(actual).toMatchSnapshot();
});
