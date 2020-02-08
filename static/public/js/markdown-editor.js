const md = window.markdownit({linkify: true});

md.disable('table');

function createEditor(textarea, preview) {
    function render() {
        preview.innerHTML = md.render(textarea.value);
        preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    textarea.addEventListener("keyup", event => {
        render();
    });
    render();
}
