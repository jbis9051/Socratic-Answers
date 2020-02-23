module.exports = (string) => {
    return encodeURIComponent(string.toLowerCase().trim().replace(/[^\w\d]+$/g, '').replace(/[^\w\d]+/g, '-'));
};
