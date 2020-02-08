createEditor(document.querySelector('#answer-input'), document.querySelector('#answer-preview'));

document.querySelectorAll('.upvote').forEach(el => {
    el.addEventListener("click", async evt => {
        const answerId = el.parentElement.getAttribute('data-answer-id');
        await vote(questionid, answerId, true);
    });
});

document.querySelectorAll('.downvote').forEach(el => {
    el.addEventListener("click", async evt => {
        const answerId = el.parentElement.getAttribute('data-answer-id');
        await vote(questionid, answerId, false);
    });
});

async function vote(questionid, answerId, upvote) {
    const formdata = new URLSearchParams();
    formdata.append("question", questionid);
    formdata.append("answer", answerId);
    formdata.append("upvote", upvote);
    const resp = await fetch(`/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formdata
    });
    const content = await resp.json();
    if (!content.success) {
        console.error(content.error);
        return false;
    }
    return true;
}
