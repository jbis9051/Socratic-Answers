const mocha = require('mocha');
const assert = require('assert');
const urlHasDomain = require('./urlHasDomain');


describe('url domains', function () {
    it('url simple', function () {
        assert.strictEqual(urlHasDomain("https://google.com", "google.com"), true);
    });

    it('url simple fail', function () {
        assert.strictEqual(urlHasDomain("https://facebook.com", "google.com"), false);
    });

    it('url tld fail', function () {
        assert.strictEqual(urlHasDomain("https://google.com", "google.org"), false);
    });

    it('url subdomain with no subdomain domain', function () {
        assert.strictEqual(urlHasDomain("https://cloud.google.com", "google.com"), true);
    });

    it('url subdomain with no subdomain domain fail', function () {
        assert.strictEqual(urlHasDomain("https://cloud.facebook.com", "google.com"), false);
    });

    it('url subdomain with subdomain domain', function () {
        assert.strictEqual(urlHasDomain("https://cloud.google.com", "cloud.google.com"), true);
    });

    it('url subdomain with no subdomain domain fail', function () {
        assert.strictEqual(urlHasDomain("https://cloud.facebook.com", "cloud.google.com"), false);
    });

    it('url subdomain with no subdomain domain fail 2', function () {
        assert.strictEqual(urlHasDomain("https://console.google.com", "cloud.google.com"), false);
    });

    it('url subdomain with subdomain domain fail 3', function () {
        assert.strictEqual(urlHasDomain("https://google.com", "cloud.google.com"), false);
    });
});
