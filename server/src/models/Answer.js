const conn = require('../database/postges.js').pool;
const TimeAgo = require('javascript-time-ago');


const markdown = require('../helpers/markdown');


TimeAgo.addLocale(require('javascript-time-ago/locale/en'));

const timeAgo = new TimeAgo('en-US');

class Answer {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow('SELECT * FROM answers WHERE id = $1', [this.id]);
        if (!row) {
            return false;
        }
        this._setAttributes(row);
        return true;
    }

    static async FromId(id) {
        const answer = new Answer(id);
        if (await answer.init()) {
            return answer;
        }
        return undefined;
    }


    async fillContent() {
        const {row} = await conn.singleRow('SELECT content FROM answers WHERE id = $1', [this.id]);
        this.content = row.content;
        this.renderedContent = markdown.render(this.content)
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
        this.last_modified = obj.last_modified;
        this.initial_question_id = obj.initial_question_id;
        this.created = obj.created;
    }

    static async getAnswers(siteid, limit = 20, offset = 0) {
        const {rows} = await conn.multiRow("SELECT * FROM answers WHERE site_id = $1 AND deleted = FALSE ORDER BY last_modified DESC LIMIT $2 OFFSET  $3", [siteid, limit, offset]);
        return rows.map(row => {
            const answer = new Answer(row.id);
            answer._setAttributes(row);
            return answer;
        });
    }

    static async create(body, site, question, creator) {
        const {row} = await conn.singleRow("INSERT INTO answers (content, site_id, initial_question_id, creator_username, creator_id) VALUES ($1,$2,$3,$4,$5) RETURNING id AS insertid", [body, site, question, creator.username, creator.id]);
        const answer = new Answer(row.insertid);
        if (question) {
            await answer.link(question);
        }
        return answer;
    }

    async link(quesitonid) {
        await conn.query("INSERT INTO questions_join_answers (question_id, answer_id) VALUES ($1,$2)", [quesitonid, this.id]);
        await conn.query("UPDATE question SET answers = answers + 1 WHERE id = $1", [quesitonid]);
    }

    async unlink(quesitonid) {
        await conn.query("DELETE FROM questions_join_answers WHERE question_id = $1 AND answer_id = $2", [quesitonid, this.id]);
        await conn.query("UPDATE question SET answers = answers - 1 WHERE id = $1", [quesitonid]);
    }

    archive(content, editorUsername, editorId) {
        return conn.query("INSERT INTO answer_edit_history (content, editor_id, editor_username) VALUES ($1,$2,$3)", [content, editorId, editorUsername]);
    }


    async edit(body, editorUsername, editorId) {
        await this.archive(body, editorUsername, editorId);
        await conn.query("UPDATE answers SET content = $1, last_modified = CURRENT_TIMESTAMP WHERE id = $2", [body, this.id]);
    }

    async getQaId(quesitonid) {
        const {row} = await conn.singleRow(`SELECT id
                                            FROM questions_join_answers
                                            WHERE question_id = $1
                                              AND answer_id = $2`, [quesitonid, this.id]);
        return row.id;
    }

    async getVotes(qaId) {
        const {row: positives} = await conn.singleRow("SELECT COUNT(*) AS total FROM votes WHERE qa_id = $1 AND upvote = TRUE", [qaId]);
        const {row: negatives} = await conn.singleRow("SELECT COUNT(*) AS total FROM votes WHERE qa_id = $1 AND upvote = FALSE", [qaId]);
        return {
            positives: positives.total,
            negatives: negatives.total,
            net: positives.total - negatives.total
        }
    }

    static solve(qaId, solve = true) {
        return conn.query("UPDATE questions_join_answers SET answer_is_solution = $1 WHERE id = $2", [solve, qaId])
    }

    async getVoteForUser(qaID, userid) {
        const {row} = await conn.singleRow("SELECT upvote FROM votes WHERE qa_id = $1 AND user_id = $2", [qaID, userid]);
        if (row === undefined) {
            return null;
        }
        return row.upvote;
    }
}

module.exports = Answer;
