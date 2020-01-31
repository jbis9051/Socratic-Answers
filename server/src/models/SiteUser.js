const User = require('./User');
const conn = require('../database/postges.js').pool;

class SiteUser extends User {
    constructor(row, siteid) {
        super(row);
        this.siteid = siteid;
    }
    async init() {
        const {row} = await conn.singleRow('SELECT id, reputation, is_moderator, created FROM user_sites WHERE user_id = $1 AND site_id = $2', [this.id, this.siteid]);
        if (!row) {
            return;
        }
        this._setAttributes(row);
    }

    _setAttributes(obj) {
        this.siteuserid = obj.id;
        this.reputation = obj.reputation;
        this.is_moderator = obj.is_moderator;
        this.created = obj.created;
    }

    static async fromUser(user, siteid){
        const siteUser = new SiteUser(user, siteid);
        await siteUser.init();
        return siteUser;
    }

}
