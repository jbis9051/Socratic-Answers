const conn = require('../database/postges.js').pool;
const Question = require('./Question');
const Answer = require('./Answer');
const Comment = require('./Comment');


class LinkQA {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow('SELECT * FROM questions_join_answers WHERE id = $1', [this.id]);
        if (!row) {
            return false;
        }
        this._setAttributes(row);
        return true;
    }

    _setAttributes(obj) {
        this.question = new Question(obj.question_id);
        this.answer = new Answer(obj.question_id);
        this.answer_is_solution = obj.answer_is_solution;
        this.added = obj.added;
    }

    static async FromId(id) {
        const linkQA = new LinkQA(id);
        if (!await linkQA.init()) {
            return null;
        }
        return linkQA;
    }

    static async FromQandA(question_id, answer_id) {
        const {row} = await conn.singleRow('SELECT * FROM questions_join_answers WHERE question_id = $1 AND answer_id = $2', [question_id, answer_id]);
        if (!row) {
            return null;
        }
        const linkQA = new LinkQA(row.id);
        linkQA._setAttributes(row);
        return linkQA;
    }

    async getVotes() {
        const {row: positives} = await conn.singleRow("SELECT COUNT(*) AS total FROM votes WHERE qa_id = $1 AND upvote = TRUE", [this.id]);
        const {row: negatives} = await conn.singleRow("SELECT COUNT(*) AS total FROM votes WHERE qa_id = $1 AND upvote = FALSE", [this.id]);
        return {
            positives: positives.total,
            negatives: negatives.total,
            net: positives.total - negatives.total
        }
    }

    async getVoteForUser(userid) {
        const {row} = await conn.singleRow("SELECT upvote FROM votes WHERE qa_id = $1 AND user_id = $2", [this.id, userid]);
        if (row === undefined) {
            return null;
        }
        return row.upvote;
    }

    async vote(userid, upvote) {
        await this.removeVote(userid);
        await conn.query("INSERT INTO votes (qa_id, user_id, upvote)  VALUES ($1, $2, $3)", [this.id, userid, upvote]);
    }

    async removeVote(userid) {
        await conn.query("DELETE FROM votes WHERE qa_id = $1 AND user_id = $2", [this.id, userid]);
    }

    async solutionize() {
        await conn.query("UPDATE questions_join_answers SET answer_is_solution = TRUE WHERE id = $1", [this.id]);
    }

    async unsolutionize() {
        await conn.query("UPDATE questions_join_answers SET answer_is_solution = FALSE WHERE id = $1", [this.id]);
    }

    static async link(question_id, answer_id) {
        const {row} = await conn.singleRow("INSERT INTO questions_join_answers (question_id, answer_id) VALUES ($1,$2)", [question_id, answer_id]);
        await conn.query("UPDATE question SET answers = answers + 1 WHERE id = $1", [question_id]);
        return new LinkQA(row.insertid);
    }

    async unlink() {
        await conn.query("DELETE FROM questions_join_answers WHERE question_id = $1 AND answer_id = $2", [this.question.id, this.answer.id]);
        await conn.query("UPDATE question SET answers = answers - 1 WHERE id = $1", [this.question.id]);
    }

   static async getAnswers(question_id, page = 1, orderby, perpage = 30) {
        const orderbyWhite = {
            "newest": "answers.created",
            "links": ""
        };
        if (!orderbyWhite.hasOwnProperty(orderby)) {
            return [];
        }
        const {rows: objs} = await conn.multiRow(`SELECT *, questions_join_answers.id AS qaid  FROM questions_join_answers INNER JOIN answers ON questions_join_answers.answer_id = answers.id WHERE questions_join_answers.question_id = $1 AND deleted = FALSE ORDER BY ${orderbyWhite[orderby]} DESC LIMIT $2 OFFSET $3`, [question_id, perpage, (page - 1) * perpage]);
        return objs.map(obj => {
            const linkQA = new LinkQA(obj.qaid);
            linkQA._setAttributes(obj);
            linkQA.answer._setAttributes(obj);
            return linkQA;
        });
    }

    static async getQuestions(answer_id, page = 1, orderby, perpage = 30) {
        const orderbyWhite = {
            "newest": "questions.created",
            "links": ""
        };
        if (!orderbyWhite.hasOwnProperty(orderby)) {
            return [];
        }
        const {rows: objs} = await conn.multiRow(`SELECT * FROM questions_join_answers INNER JOIN question ON questions_join_answers.question_id = question.id WHERE questions_join_answers.answer_id = $1 AND deleted = FALSE ORDER BY ${orderbyWhite[orderby]} DESC LIMIT $2 OFFSET $3`, [answer_id, perpage, (page - 1) * perpage]);
        return objs.map(obj => {
            const linkQA = new LinkQA(obj.id);
            linkQA._setAttributes(obj);
            linkQA.question._setAttributes(obj);
        });
    }

    async getComments(){
        const {rows} = await conn.multiRow("SELECT * FROM comments WHERE qa_id = $1", [this.id]);
        return rows.map(row => {
            const comment = new Comment(row.id);
            comment._setAttributes(row);
            return comment;
        });
    }
}

module.exports = LinkQA;
