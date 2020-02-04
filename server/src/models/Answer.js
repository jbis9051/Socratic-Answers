const conn = require('../database/postges.js').pool;
const TimeAgo = require('javascript-time-ago');

TimeAgo.addLocale(require('javascript-time-ago/locale/en'));

const timeAgo = new TimeAgo('en-US');

class Answer {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow('SELECT * FROM answers WHERE id = $1', [this.id]);
        if (!row) {
            return;
        }
        this._setAttributes(row);
    }

    static async FromId(id) {
        const answer = new Answer(id);
        await answer.init();
        return answer;
    }


    async getContent() {
        const {row} = await conn.singleRow('SELECT content FROM answers WHERE id = $1', [this.id]);
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
        this.is_solution = obj.is_solutionl
        this.last_modified = obj.last_modified;
        this.solutions = obj.solutions;
        this.score = obj.score;
        this.created = obj.created;
        if (obj.hasOwnProperty("taglist")) {
            this.taglist = obj.taglist;
        } else {
            this.taglist = obj.tag_string ? Array.from(obj.tag_string.matchAll(/<([^ >]+)>/g)).map(arr => arr[1]) : [];
        }
    }

    static async getAnswers(siteid, limit = 20, offset = 0) {
        const {rows} = await conn.multiRow("SELECT * FROM answers WHERE site_id = $1 AND deleted = FALSE ORDER BY last_modified DESC LIMIT $2 OFFSET  $3", [siteid, limit, offset]);
        return rows.map(row => {
            const answer = new Answer(row.id);
            answer._setAttributes(row);
            return answer;
        });
    }
}

module.exports = Answer;
