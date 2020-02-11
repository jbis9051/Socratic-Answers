
const md = require('markdown-it')({
    linkify: true
}).use(require('markdown-it-highlightjs'), {auto: true});

md.disable('table');
//md.renderer.rules.code_block = md.renderer.rules.fence;
module.exports = {
    render: (str) => {
        return md.render(str);
    }
};
