const hljs = require('highlight.js'); // https://highlightjs.org/

function replaceClass(str) {
    return str
        .replace(/<code class="/g, '<code class="hljs ')
        .replace(/<code>/g, '<code class="hljs">');
}

const md = require('markdown-it')({
    highlight: function (str, lang) {

        if (lang && hljs.getLanguage(lang)) {
            try {
                return replaceClass(hljs.highlight(lang, str).value);
            } catch (__) {w
            }
        } else {
            try {
                return replaceClass(hljs.highlightAuto(str).value);
            } catch (__) {
            }
        }

        return ''; // use external default escaping
    },
    linkify: true
});

md.disable('table');
md.renderer.rules.code_block = md.renderer.rules.fence;
module.exports = {
    render: (str) => {
        return replaceClass(md.render(str));
    }
};
