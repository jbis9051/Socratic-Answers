const conn = require('../database/postges.js').pool;
const TimeAgo = require('javascript-time-ago');

const Answer = require('../models/Answer');
const markdown = require('../helpers/markdown');

TimeAgo.addLocale(require('javascript-time-ago/locale/en'));

const timeAgo = new TimeAgo('en-US');

class Question {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow('SELECT creator_id, creator_username, title, created,last_modified, tag_string, score, answers, solutions FROM question WHERE id = $1', [this.id]);
        if (!row) {
            return false;
        }
        this._setAttributes(row);
        return true;
    }

    static async FromId(id) {
        const question = new Question(id);
        if (await question.init()) {
            return question;
        }
        return undefined;
    }

    static async getTitle(id) {
        const {row} = await conn.singleRow('SELECT title FROM question WHERE id = $1', [id]);
        if (!row) {
            return;
        }
        return row.title;
    }

    async fillContent() {
        const {row} = await conn.singleRow('SELECT content FROM question WHERE id = $1', [this.id]);
        this.content = row.content;
        this.renderedContent = markdown.render(this.content);
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
        this.solutions = obj.solutions;
        this.answers = obj.answers;
        this.score = obj.score;
        this.created = obj.created;
        this.tag_string = obj.tag_string;
        if (obj.hasOwnProperty("taglist")) {
            this.taglist = obj.taglist;
        } else {
            this.taglist = obj.tag_string ? Question.tagStringToArray(obj.tag_string) : [];
        }
    }

    static tagStringToArray(str) {
        return Array.from(str.matchAll(/<([^ >]+)>/g)).map(arr => arr[1]);
    }

    static async getQuestions(siteid, limit = 20, offset = 0) {
        const {rows} = await conn.multiRow("SELECT id, creator_id, creator_username, title, created, last_modified, tag_string, score, answers, solutions FROM question WHERE site_id = $1 AND deleted = FALSE ORDER BY last_modified DESC LIMIT $2 OFFSET  $3", [siteid, limit, offset]);
        return rows.map(row => {
            const question = new Question(row.id);
            question._setAttributes(row);
            return question;
        });
    }

    static async create(title, body, tags, siteid, creator) {
        const tagString = tags.map(tag => '<' + tag + '>').join("");
        const {row} = await conn.singleRow("INSERT INTO question (creator_id, creator_username, site_id, title, content, tag_string) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id AS insertId", [creator.id, creator.username, siteid, title, body, tagString]);
        const question = await Question.FromId(row.insertid);
        await question.archive(title, body, tagString, creator.username, creator.id);
        return question;
    }

    archive(title, body, tagString, editorUsername, editorId) {
        return conn.query("INSERT INTO question_edit_history (title, content, tag_string, editor_id, editor_username, question_id) VALUES ($1,$2,$3,$4, $5, $6)", [title, body, tagString, editorId, editorUsername, this.id]);
    }

    async edit(title, body, tags, editorUsername, editorId) {
        this.title = title;
        this.content = body;
        this.renderedContent = markdown.render(this.content);
        this.taglist = tags;
        this.tag_string = tags.map(tag => '<' + tag + '>').join("");
        await this.archive(title, body, this.tag_string, editorUsername, editorId);
        await conn.query("UPDATE question SET title = $1, content = $2, tag_string = $3, last_modified = CURRENT_TIMESTAMP WHERE id = $4", [this.title, this.content, this.tag_string, this.id]);
    }

    async getHistory() {
        const {rows} = await conn.multiRow("SELECT * FROM question_edit_history WHERE question_id = $1 ORDER BY modification_date DESC", [this.id]);
        return rows.map(row => {
            return {
                title: row.title,
                modification_string: timeAgo.format(row.modification_date),
                modification_date: row.modification_date,
                renderedContent: markdown.render(row.content),
                editor: {
                    username: row.editor_username,
                    id: row.editor_id
                },
                tag_string: row.tag_string,
                taglist: Question.tagStringToArray(row.tag_string)
            }
        });
    }
}

module.exports = Question;
