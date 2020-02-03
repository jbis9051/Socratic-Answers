const express = require('express');
const router = express.Router();
const Site = require('../models/Site');

let sites = {};

Site.getAllSites().then(allsites => {
    allsites.forEach(site => {
       sites[site.subdomain] = site;
    });
});


router.use('*', function (req, res, next) {
    const subString = req.subdomains.reverse().join(".");
    if(!sites.hasOwnProperty(subString)){
        console.log(subString);
        res.end();
        return;
    }
    req.site = sites[subString];
    res.locals.site = sites[subString];
    next();
});

module.exports = router;
