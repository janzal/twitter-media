module.exports = function(buffer, chunkSize) {
    const chunks = Math.ceil(buffer.length / chunkSize);

    return new Array(chunks).fill(null).map((_, index) => {
        const start = index * chunkSize;
        const end = (index === chunks - 1) ? undefined : (index + 1) * chunkSize;
        return buffer.slice(start, end);
    });
};
