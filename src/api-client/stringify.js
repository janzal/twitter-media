module.exports = function stringify(object) {
    return JSON.stringify(replaceBuffers(object));
};

function replaceBuffers(object) {
    return entries(object).reduce((state, [key, value]) => {
        const stringifyValue = () => {
            if (Buffer.isBuffer(value)) {
                const { data } = value.slice(0, 5).toJSON();
                return `<Buffer ${data.map((byte) => byte.toString(16)).join(' ')} ...>`;
            } else if (value === Object(value)) {
                return replaceBuffers(value);
            } else {
                return value;
            }
        };

        return Object.assign({}, state, { [key]: stringifyValue() });
    }, {});
}

function entries(object) {
    return Object.keys(object || {}).map((key) => [key, object[key]]);
}
