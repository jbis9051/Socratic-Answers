const url = require('url');

module.exports = (urlString, domain) => {
    if (!urlString) {
        return false;
    }
    const urlobj = url.parse(urlString);
    if (!urlobj.hostname) {
        return false;
    }
    const hostnameParts = urlobj.hostname.split('.').reverse();
    const domainParts = domain.split(".").reverse();
    if (domainParts.length > hostnameParts.length) {
        return false;
    }
    return domainParts.every((part, index) => hostnameParts[index] === part);
};
