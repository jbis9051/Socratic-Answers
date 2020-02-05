const conn = require('../database/postges').pool;

class Site {
    constructor(id) {
        this.id = id;
    }

    async init() {
        const {row} = await conn.singleRow('SELECT * FROM sites WHERE id = $1', [this.id]);
        if (!row) {
            return;
        }
        this._setAttributes(row);
    }

    _setAttributes(obj) {
        this.name = obj.name;
        this.description = obj.description;
        this.subdomain = obj.subdomain;
        this.parent_site = obj.parent_site ? obj.parent_site : null;
        this.created = obj.created;
        this.is_meta = obj.is_meta;
    }

    hasParent() {
        return !!this.parent_site;
    }

    async getParent() {
        if (!this.hasParent()) {
            return null;
        }
        const site = new Site(this.parent_site);
        await site.init();
        return site;
    }

    getChildren() {

    }

    async getMeta() {
        const {row} = conn.singleRow("SELECT * FROM sites WHERE is_meta = TRUE AND parent_site = $1", [this.id])
        if (!row) {
            return null;
        }
        const site = new Site(row.id);
        site._setAttributes(row);
        return site;
    }

    static async getAllSites() {
        const {rows} = await conn.multiRow("SELECT * FROM sites");
        return rows.map(site => {
            const theSite = new Site(site.id);
            theSite._setAttributes(site);
            return theSite;
        });
    }
}

module.exports = Site;
