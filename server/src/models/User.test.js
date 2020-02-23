const mocha = require('mocha');
const assert = require('assert');

const User = require('./User');
const conn = require('../database/postges').pool;

const userInfo = {
    username: "test2",
    email: "test2@gmail.com",
    password: "testing123",
    location: "TestingScript",
    bio: "# Testing",
    website: "http://example.com",
    github: "https://github.com/test"
};

describe('sign up process', async function () {
    it('should Sign Up', async function(){
        const user = await User.signUp(userInfo.username, userInfo.email, userInfo.password);
        userInfo.id = user.id;
        assert.strictEqual(user.username, userInfo.username);
        assert.strictEqual(user.email, userInfo.email);
    });

    it('should set information', async function(){
        const user = await User.FromId(userInfo.id);
        await user.updateBioFields(userInfo.bio, userInfo.location, userInfo.website, userInfo.github);
        await user.fillBioFields();
        assert.strictEqual(user.bio, userInfo.bio);
        assert.strictEqual(user.location, userInfo.location);
        assert.strictEqual(user.website, userInfo.website);
        assert.strictEqual(user.github, userInfo.github);
    });

    it('should update information', async function(){
        const user = await User.FromId(userInfo.id);
        await user.updateBioFields(userInfo.bio + "new", userInfo.location + "new", userInfo.website + "new", userInfo.github + "new");
        await user.fillBioFields();
        assert.strictEqual(user.bio, userInfo.bio + "new");
        assert.strictEqual(user.location, userInfo.location + "new");
        assert.strictEqual(user.website, userInfo.website + "new");
        assert.strictEqual(user.github, userInfo.github + "new");
    });

    it('should remove information', async function(){
        const user = await User.FromId(userInfo.id);
        await user.updateBioFields("", "", "", "");
        await user.fillBioFields();
        assert.strictEqual(user.bio, null);
        assert.strictEqual(user.location, null);
        assert.strictEqual(user.website, null);
        assert.strictEqual(user.github, null);
    });

    after('should remove user', async function () {
        await conn.query("DELETE FROM users WHERE id = $1", [userInfo.id]);
        const user = await User.FromId(userInfo.id);
        assert.strictEqual(user, null);
    })
});

