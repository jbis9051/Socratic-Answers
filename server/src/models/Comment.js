const markdown = require('../helpers/markdown');
const conn = require('../database/postges.js').pool;

class Comment {
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }

    async init() {
        let row;
        if(this.type === "link"){
            row = await conn.singleRow("SELECT * FROM \"link-comments\" WHERE id = $1", [this.id]);
        } else {
            row = await conn.singleRow("SELECT * FROM \"question-comments\" WHERE id = $1", [this.id]);
        }
        this._setAttributes(row.row);
    }

    _setAttributes(obj) {
        if(this.type === "question"){
            this.question_id = obj.question_id;
        } else {
            this.qa_id = obj.qa_id;
        }
        this.id = obj.id;
        this.creator = {
            id: obj.user_id,
            username: obj.username
        };
        this.content = obj.content;
        this.renderedContent = markdown.render(this.content);
        this.created = obj.created;
    }

    static async FromId(id, type) {
        const comment = new Comment(id, type);
        if (!await comment.init()) {
            return null;
        }
        ;
        return comment;
    }

    static async create(id, type, user_id, content, username) {
        let row;
        if(type === "question"){
            row = await conn.singleRow("INSERT INTO \"question-comments\" (question_id, user_id, content, username) VALUES ($1, $2, $3,$4) RETURNING id AS insertid", [id, user_id, content, username]);

        } else if (type === "link"){
            row = await conn.singleRow("INSERT INTO \"link-comments\" (qa_id, user_id, content, username) VALUES ($1, $2, $3,$4) RETURNING id AS insertid", [id, user_id, content, username]);
        } else {
            throw "Invalid type"
        }
        return new Comment(row.row.insertid, type);
    }

    edit(content) {
        this.content = content;
        this.renderedContent = markdown.render(this.content);
        return conn.query("UPDATE \"link-comments\" SET content = $1 WHERE id  = $2", [content, this.id])
    }

    delete() {
        return conn.query("DELETE FROM \"link-comments\" WHERE id = $1", [this.id])
    }
}

module.exports = Comment;
