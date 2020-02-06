const express = require('express');
const router = express.Router();

const Site = require('../models/Site');

const homeRouter = require('../routes/home');

let sites = {};

Site.getAllSites().then(allsites => {
    allsites.forEach(site => {
        sites[site.subdomain] = site;
    });
    Object.values(sites).forEach(site => {
        const meta_site = Object.values(sites).find(possible_meta => possible_meta.is_meta && possible_meta.parent_site === site.id);
        if (meta_site) {
            site.meta_site = meta_site;
        }
    })
});


router.use('*', function (req, res, next) {
    if (req.subdomains.length === 0) {
        return homeRouter(req, res, next);
    }
    const subString = req.subdomains.reverse().join(".");
    if (!sites.hasOwnProperty(subString)) {
        next(404);
        return;
    }
    req.site = sites[subString];
    res.locals.site = sites[subString];
    next();
});

module.exports = router;
