const conn = require('../database/postges.js').pool;
const TimeAgo = require('javascript-time-ago');

TimeAgo.addLocale(require('javascript-time-ago/locale/en'));

const timeAgo = new TimeAgo('en-US');

class Question {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow('SELECT creator_id, creator_username, title, created,last_modified, tag_string, score, answers, answered FROM question WHERE id = $1', [this.id]);
        if (!row) {
            return;
        }
        this._setAttributes(row);
    }

    static async FromId(id) {
        const question = new Question(id);
        await question.init();
        return question;
    }

    static async getTitle(id) {
        const {row} = await conn.singleRow('SELECT title FROM question WHERE id = $1', [id]);
        if (!row) {
            return;
        }
        return row.title;
    }

    async getContent() {
        const {row} = await conn.singleRow('SELECT content FROM question WHERE id = $1', [this.id]);
        return row.content;
    }

    getCreatedFriendlyTimeAgo() {
        return timeAgo.format(this.created);
    }

    getModifiedFriendlyTimeAgo() {
        return timeAgo.format(this.last_modified);
    }

    _setAttributes(obj) {
        this.creator = {
            id: obj.creator_id,
            username: obj.creator_username,
        };
        this.title = obj.title;
        this.last_modified = obj.last_modified;
        this.answered = obj.answered;
        this.answers = obj.answers;
        this.score = obj.score;
        this.created = obj.created;
        if (obj.hasOwnProperty("taglist")) {
            this.taglist = obj.taglist;
        } else {
            this.taglist = obj.tag_string ? Array.from(obj.tag_string.matchAll(/<([^ >]+)>/g)).map(arr => arr[1]) : [];
        }
    }

    static async getQuestions(siteid, limit = 20, offset = 0) {
        const {rows} = await conn.multiRow("SELECT id, creator_id, creator_username, title, created, last_modified, tag_string, score, answers, answered FROM question WHERE site_id = $1 AND deleted = FALSE ORDER BY last_modified DESC LIMIT $2 OFFSET  $3", [siteid, limit, offset]);
        return rows.map(row => {
            const question = new Question(row.id);
            question._setAttributes(row);
            return question;
        });
    }
}

module.exports = Question;
