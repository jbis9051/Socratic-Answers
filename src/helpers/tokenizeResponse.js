module.exports = async function tokenizeResponse(user, res) {
    const token = await user.addToken();
    const date = new Date();
    date.setHours(date.getHours() + 24);
    res.cookie("token", token, {
        expires: date,
        httpOnly: true,
        path: '/',
        secure: false,
        sameSite: 'Strict',
    });
};
