const config = require("../../config.json");

const mailgun = null;  //require('mailgun-js')(config.mailgun);
/**
 *
 * @type {Mailgun}
 */
module.exports = {
    mailgun: mailgun,
    helpers: {
        /**
         *
         * @param to
         * @param subject
         * @param text
         * @param from
         * @return {Promise<unknown>}
         */
        simpleText: (to, subject, text, from = "Sitename") => {
            return new Promise((resolve, reject) => {
                console.log(`${subject}: ${text}`); // for debug
                resolve();
                return;
                mailgun.messages().send({
                    from: `${from} <noreply@${config.mailgun.domain}>`,
                    to: to,
                    subject: subject,
                    text: text
                }, (error, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body)
                    }
                });
            });
        },
    },
};
