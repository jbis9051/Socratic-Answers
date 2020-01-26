const bcrypt = require('bcrypt');
const crypto = require("crypto");

const conn = require('../database/mysql.js').create();
const mailgun = require('../helpers/mailgun.js');

const TimeHelper = require('../helpers/time');

class User {
    constructor(row) {
        if (row) {
            this.id = row["id"];
            this.email = row["email"];
            this.profile_image = row["profile_image"];
            this.username = row["username"];
        }
    }

    /* getters */

    async getEmailConfirmed(){
        const [[row]] = await conn.execute("SELECT email_confirmed FROM users WHERE id = ?", [this.id]);
        return row.email_confirmed === 1;
    }

    /* creation */

    static async FromQuery(query) {
        const [[row]] = await query;
        if (!row) {
            return null;
        }
        return new User(row);
    }

    static FromId(id) {
        return User.FromQuery(conn.execute("SELECT * FROM `users` WHERE id = ?", [id]));
    }

    static FromEmail(email) {
        return User.FromQuery(conn.execute("SELECT * FROM `users` WHERE email = ?", [email]));
    }

    static async FromToken(token) {
        if (!token) {
            return null;
        }
        const [[row]] = await conn.execute("SELECT token,user_id FROM `tokens` WHERE `token` = ? AND `created` >=  CURDATE() - INTERVAL 1 DAY", [token]);
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

        conn.execute("INSERT INTO `confirmation-emails` (userid, code, email) VALUES (?, ?, ?)", [this.id, token, email]);


        return await mailgun.helpers.simpleText(this.email, "Confirm Email - Sitename", `Please click the link below to confirm your email for Sitename. 
        
        https://Sitename.com/users/confirm?token=${token}
        
        `);
    }

    static _removeConfirmationEmail(id) {
        return conn.execute("DELETE FROM `confirmation-emails` WHERE id = ?", [id]);
    }

    async resendInitialConfirmEmailIfNecessary(){
        const [[row]] = await conn.execute("SELECT id, created, email FROM `confirmation-emails` WHERE email = ?", [this.email]);
        if(TimeHelper.daysBetweenMili(row.created.getTime(), Date.now()) >= 1){
            User._removeConfirmationEmail(row.id);
            await this.sendConfirmEmail(row.email);
        }
    }

    resendConfirmEmailIfNecessary(timeout = 1) {
        const [[row]] = conn.execute("SELECT created FROM `confirmation-emails` WHERE userid = ?", [this.id]);
        if (TimeHelper.daysBetweenMili(row.created.getTime(), Date.now()) >= timeout) {
            return this.sendConfirmEmail(this.email);
        }
    }


    static async confirmEmail(token) {
        const [[row]] = await conn.execute("SELECT id,userid,email,created,code FROM `confirmation-emails` WHERE code = ?", [token]);
        if (!row) {
            return false;
        }
        if (TimeHelper.daysBetweenMili(row.created.getTime(), Date.now()) >= 1) {
            return false;
        }
        if (!crypto.timingSafeEqual(Buffer.from(row.code), Buffer.from(token))) {
            return false;
        }
        await Promise.all([User._removeConfirmationEmail(row.id), conn.execute("UPDATE users SET email = ?, email_confirmed = TRUE WHERE id = ?", [row.email, row.userid])]);
        return await User.FromId(row.userid);
    }


    /* signup */

    static async signUp(username, email, password) {
        const hash = await bcrypt.hash(password, 10);
        const [results] = await conn.execute("INSERT INTO `users` (`username`,`password`,`email`) VALUES (?,?,?)", [username, hash, email]);
        return await User.FromId(results.insertId);
    }

    static async emailExists(email) {
        return !!(await User.FromEmail(email));
    }


    /* authentication */

    static async authenticateUser(email, password) {
        const [[row]] = await conn.execute("SELECT password FROM `users` WHERE email = ?", [email]);
        if (!row) {
            return false;
        }
        return bcrypt.compare(password, row.password);
    }


    removeAllTokens() {
        return conn.execute("DELETE FROM tokens WHERE user_id = ?", [this.id]);
    }

    static removeToken(token) {
        return conn.execute("DELETE FROM tokens WHERE token = ?", [token]);
    }

    removeTokensOldThan(days) {
        return conn.execute("DELETE FROM tokens WHERE user_id = ? AND created <= CURDATE() - INTERVAL ? DAY", [this.id, days]);
    }

    async addToken() {
        const token = crypto.randomBytes(64).toString('hex');
        await conn.execute("INSERT INTO tokens (token, user_id) VALUES (?, ?)", [token, this.id]);
        return token;
    }

    /* profile changes */


}

module.exports = User;

module.exports = User;
