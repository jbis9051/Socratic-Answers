const markdown = require('../helpers/markdown');
const conn = require('../database/postges.js').pool;

class Comment {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow("SELECT * FROM comments WHERE id = $1", [this.id]);
        this._setAttributes(row);
    }

    _setAttributes(obj) {
        this.qa_id = obj.qa_id;
        this.creator = {
            id: obj.user_id,
            username: obj.username
        };
        this.content = obj.content;
        this.renderedContent = markdown.render(this.content);
        this.created = obj.created;
    }

    static async FromId(id) {
        const comment = new Comment(id);
        if (!await comment.init()) {
            return null;
        }
        ;
        return comment;
    }

    static async create(qa_id, user_id, content, username) {
        const {row} = await conn.singleRow("INSERT INTO comments (qa_id, user_id, content, username) VALUES ($1, $2, $3,$4) RETURNING id AS insertid", [qa_id, user_id, content, username]);
        return new Comment(row.insertid);
    }

    edit(content) {
        this.content = content;
        this.renderedContent = markdown.render(this.content);
        return conn.query("UPDATE comments SET content = $1 WHERE id  = $2", [content, this.id])
    }

    delete() {
        return conn.query("DELETE FROM comments WHERE id = $1", [this.id])
    }
}

module.exports = Comment;
