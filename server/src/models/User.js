const bcrypt = require('bcrypt');
const crypto = require("crypto");

const conn = require('../database/postges.js').pool;
const mailgun = require('../helpers/mailgun.js');

const TimeHelper = require('../helpers/time');

class User {
    constructor(row) {
        if (row) {
            this.id = row["id"];
            this.email = row["email"];
            this.profile_image = row["profile_image"];
            if (this.profile_image === null) {
                this.profile_image = "http://localhost:3000/images/users/placeholder.png";
            }
            this.username = row["username"];
        }
    }

    async fillBioFields() {
        const {row} = await conn.singleRow("SELECT bio, location,website,github FROM users WHERE id = $1", [this.id]);
        this.bio = row.bio;
        this.location = row.location;
        this.website = row.website;
        this.github = row.github;
    }

    async updateBioFields(bio,location, website, github) {
        bio = bio || null;
        location = location || null;
        website = website || null;
        github = github || null;
        await conn.query("UPDATE users SET bio = $1,location = $2, website = $3, github = $4 WHERE id = $5", [bio, location, website, github, this.id]);
        this.bio = bio;
        this.website = website;
        this.github = github;
    }

    /* getters */

    async getEmailConfirmed() {
        const {row} = await conn.singleRow("SELECT email_confirmed FROM users WHERE id = $1", [this.id]);
        return row.email_confirmed;
    }

    static async getUsername(id) {
        const {row} = await conn.singleRow("SELECT username FROM users WHERE id = $1", [id]);
        return row.username;
    }

    /* creation */

    static async FromQuery(query) {
        const {row} = await query;
        if (!row) {
            return null;
        }
        return new User(row);
    }

    static FromId(id) {
        return User.FromQuery(conn.singleRow("SELECT * FROM users WHERE id = $1", [id]));
    }

    static FromEmail(email) {
        return User.FromQuery(conn.singleRow("SELECT * FROM users WHERE email = $1", [email]));
    }

    static async FromToken(token) {
        if (!token) {
            return null;
        }
        const {row} = await conn.singleRow("SELECT token,user_id FROM tokens WHERE token = $1 AND created >=  CURRENT_DATE - INTERVAL '10' DAY", [token]);
        if (!row || token.length !== row.token.length || !(await crypto.timingSafeEqual(Buffer.from(token), Buffer.from(row.token)))) {
            return null;
        }
        return await User.FromId(row.user_id);
    }

    static async FromCredentials(email, password) {
        if (await User.authenticateUser(email, password)) {
            return User.FromEmail(email);
        }
        return false;
    }


    /* email */

    async sendConfirmEmail(email) {

        const token = crypto.randomBytes(64).toString('hex');

        conn.query("INSERT INTO \"confirmation-emails\" (userid, code, email) VALUES ($1, $2, $3)", [this.id, token, email]);


        return await mailgun.helpers.simpleText(this.email, "Confirm Email - Sitename", `Please click the link below to confirm your email for Sitename. 
        
        https://Sitename.com/users/confirm?token=${token}
        
        `);
    }

    static _removeConfirmationEmail(id) {
        return conn.query("DELETE FROM \"confirmation-emails\" WHERE id = $1", [id]);
    }

    async resendInitialConfirmEmailIfNecessary() {
        const {row} = await conn.singleRow("SELECT id, created, email FROM \"confirmation-emails\" WHERE email = $1", [this.email]);
        if (!row) { // confirmation email wasn't sent for some reason
            await this.sendConfirmEmail(this.email);
            return;
        }
        if (TimeHelper.daysBetweenMili(row.created.getTime(), Date.now()) >= 1) { // expired
            User._removeConfirmationEmail(row.id);
            await this.sendConfirmEmail(row.email);
        }
    }

    resendConfirmEmailIfNecessary(timeout = 1) {
        const {row} = conn.singleRow("SELECT created FROM \"confirmation-emails\" WHERE userid = $1", [this.id]);
        if (TimeHelper.daysBetweenMili(row.created.getTime(), Date.now()) >= timeout) {
            return this.sendConfirmEmail(this.email);
        }
    }


    static async confirmEmail(token) {
        const {row} = await conn.singleRow("SELECT id,userid,email,created,code FROM \"confirmation-emails\" WHERE code = $1", [token]);
        if (!row) {
            return false;
        }
        if (TimeHelper.daysBetweenMili(row.created.getTime(), Date.now()) >= 1) {
            return false;
        }
        if (!crypto.timingSafeEqual(Buffer.from(row.code), Buffer.from(token))) {
            return false;
        }
        await Promise.all([User._removeConfirmationEmail(row.id), conn.query("UPDATE users SET email = $1, email_confirmed = TRUE WHERE id = $2", [row.email, row.userid])]);
        return await User.FromId(row.userid);
    }


    /* signup */

    static async signUp(username, email, password) {
        const hash = await bcrypt.hash(password, 10);
        const {row} = await conn.singleRow("INSERT INTO users (username,password,email) VALUES ($1,$2,$3) RETURNING id AS insertId", [username, hash, email]);
        return await User.FromId(row.insertid);
    }

    static async emailExists(email) {
        return !!(await User.FromEmail(email));
    }


    /* authentication */

    static async authenticateUser(email, password) {
        const {row} = await conn.singleRow("SELECT password FROM users WHERE email = $1", [email]);
        if (!row) {
            return false;
        }
        return bcrypt.compare(password, row.password);
    }


    removeAllTokens() {
        return conn.query("DELETE FROM tokens WHERE user_id = $1", [this.id]);
    }

    static removeToken(token) {
        return conn.query("DELETE FROM tokens WHERE token = $1", [token]);
    }

    removeTokensOldThan(days) {
        return conn.query("DELETE FROM tokens WHERE user_id = $1 AND created <= CURRENT_DATE - INTERVAL $2 DAY", [this.id, days.toString()]);
    }

    async addToken() {
        const token = crypto.randomBytes(64).toString('hex');
        await conn.query("INSERT INTO tokens (token, user_id) VALUES ($1, $2)", [token, this.id]);
        return token;
    }

    /* profile changes */


    /* other */

    toSiteUser() {

    }

}

module.exports = User;
