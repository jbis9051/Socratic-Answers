const markdown = require('../helpers/markdown');


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
        this.user_id = obj.user_id;
        this.content = obj.content;
        this.renderedContent = markdown.render(this.content);
        this.created = obj.created;
    }

    async FromId(id) {
        const comment = new Comment(id);
        await comment.init();
        return comment;
    }

    static async create(qa_id, user_id, content) {
        const {row} = await conn.singleRow("INSERT INTO comments (qa_id, user_id, content) VALUES ($1, $2, $3)", [qa_id, user_id, content]);
        return new Comment(row.insertid);
    }

    edit(content) {
        this.content = content;
        this.renderedContent = markdown.render(this.content);
        return conn.query("UPDATE comments SET content = $1 WHERE id  = $2", [content, this.id])
    }
}

module.exports = Comment;
