const express = require('express');
const router = express.Router();

const Site = require('../models/Site');

const homeRouter = require('../routes/home');
const mainRouter = require('../routes');

let sites = {};

Site.getAllSites().then(allsites => {
    allsites.forEach(site => {
        sites[site.subdomain] = site;
    });
    Object.values(sites).forEach(site => {
        if (site.is_meta) {
            const parent_site = Object.values(sites).find(possible_parent => !possible_parent.is_meta && possible_parent.id === site.parent_site);
            if (parent_site) {
                site.parent_site = parent_site;
            }
        } else {
            const meta_site = Object.values(sites).find(possible_meta => possible_meta.is_meta && possible_meta.parent_site === site.id);
            if (meta_site) {
                site.meta_site = meta_site;
            }
        }
    })
});


router.all('*', function (req, res, next) {
    if (req.subdomains.length === 0) {
        req.site = -1;
        res.locals.site = -1;
        return homeRouter(req, res, next);
    }
    const subString = req.subdomains.reverse().join(".");
    if (!sites.hasOwnProperty(subString)) {
        next(404);
        return;
    }
    req.site = sites[subString];
    res.locals.site = sites[subString];
    return mainRouter(req, res, next);
});

module.exports = router;
