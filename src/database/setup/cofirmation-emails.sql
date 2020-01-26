CREATE TABLE `confirmation-emails`
(
    id      INT AUTO_INCREMENT,
    userid  INT                                NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    email   VARCHAR(256)                       NOT NULL,
    code    VARCHAR(256)                       NOT NULL,
    CONSTRAINT `confirmation-emails_pk`
        PRIMARY KEY (id),
    CONSTRAINT `confirmation-emails_users_id_fk`
        FOREIGN KEY (userid) REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE UNIQUE INDEX `confirmation-emails_code_uindex`
    ON `confirmation-emails` (code);
