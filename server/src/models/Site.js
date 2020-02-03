const conn = require('../database/postges').pool;

class Site {
    constructor(id) {
        this.id = id;
    }

    _setAttributes(obj) {
        this.name = obj.name;
        this.description = obj.description;
        this.subdomain = obj.subdomain;
        this.parent_site = obj.parent_site ? new Site(obj.parent_site) : null;
        this.created = obj.created;
    }

    hasParent(){
        return !!this.parent_site;
    }

    static async getAllSites(){
        const {rows} = await conn.multiRow("SELECT * FROM sites");
        return rows.map(site => {
            const theSite = new Site(site.id);
            theSite._setAttributes(site);
            return theSite;
        });
    }
}
module.exports = Site;
