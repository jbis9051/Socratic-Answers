const glob = require('glob');

module.exports.getEntries = function (context, extension) {
    if (context[context.length - 1] !== '/') {
        context += '/';
    }

    extension = `.${extension}`;

    const files = glob.sync(`${context}**/*${extension}`);
    const entries = {};

    files.forEach((file) => {
        entries[file.replace(context, '').replace(extension, '')] = file;
    });

    return entries;
};
