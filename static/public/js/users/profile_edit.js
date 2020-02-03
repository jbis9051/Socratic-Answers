const fileInput = document.querySelector('#fileInput');
const imageWrapper = document.querySelector('.profile-image-wrapper');
imageWrapper.addEventListener("click", _ => {

});

const md = window.markdownit();
const bioInput = document.querySelector('#bioInput');
const bioRender = document.querySelector('#bioRender');


function render() {
    bioRender.innerHTML = md.render(bioInput.value);
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

render();

bioInput.addEventListener("keyup", _ => {
    render();

});

const form = document.querySelector('#form');

form.addEventListener("submit", e => {

});
