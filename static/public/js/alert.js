let currentAlert = null;

const alertTransitionInTime = 500;
const alertTransitionOutTime = 500;
const alertHoverTime = 3000;

async function createAlert(type, text) {
    if (currentAlert !== null) {
        await clearAlert(currentAlert);
    }
    const div = document.createElement("div");
    div.classList.add("alert-wrapper", type);
    div.innerHTML = `
    <span class="alert--content"></span>
    <span class="alert--x">✖</span>
    `;
    div.querySelector('.alert--content').innerText = text;
    div.querySelector('.alert--x').addEventListener("click", function () {
        clearAlert(div);
    });
    div.timeout = setTimeout(function () {
        clearAlert(div);
    }, alertHoverTime);
    currentAlert = div;
    document.body.append(div);
}

function clearAlert(currentAlert) {
    return new Promise(function (resolve) {
        clearTimeout(currentAlert.timeout);
        currentAlert.classList.add("closed");
        setTimeout(function () {
            currentAlert.remove();
            resolve();
        }, alertTransitionOutTime);
    });
}
