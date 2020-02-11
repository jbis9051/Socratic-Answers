createEditor(document.querySelector('#answer-input'), document.querySelector('#answer-preview'));

document.querySelectorAll('.upvote').forEach(el => {
    el.addEventListener("click", async evt => {
        _handleClick(el, true);
    });
});

document.querySelectorAll('.downvote').forEach(el => {
    el.addEventListener("click", async evt => {
        _handleClick(el, false);
    });
});

function _handleClick(el, positive) {
    const oppArrowSelector = el.parentElement.querySelector(positive ? '.downvote' : '.upvote');

    let main;
    let opp;
    if (positive) {
        main = el.parentElement.querySelector('.positive');
        opp = el.parentElement.querySelector('.negative');
    } else {
        opp = el.parentElement.querySelector('.positive');
        main = el.parentElement.querySelector('.negative');
    }

    const answerId = el.parentElement.getAttribute('data-answer-id');
    oppArrowSelector.classList.remove("selected");
    if (el.classList.contains("selected")) {
        unvote(questionid, answerId).then(_ => {
            addToVote(main, -1);
            el.classList.remove("selected");
        });
    } else {
        vote(questionid, answerId, positive).then(_ => {
            el.classList.add("selected");
            addToVote(main, 1);
            addToVote(opp, -1);
        });
    }
}

function addToVote(el, amount) {
    el.querySelector('span').innerText = Math.max(parseInt(el.querySelector('span').innerText) + amount, 0).toString();
}

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
        if(content.error === "")
        return false;
    }
    return true;
}


async function unvote(questionid, answerId) {
    const formdata = new URLSearchParams();
    formdata.append("question", questionid);
    formdata.append("answer", answerId);
    const resp = await fetch(`/unvote`, {
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
