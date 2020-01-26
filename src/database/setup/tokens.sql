CREATE TABLE tokens
(
    id      INT AUTO_INCREMENT,
    user_id INT                                NOT NULL,
    token   VARCHAR(256)                       NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tokens_pk
        PRIMARY KEY (id),
    CONSTRAINT tokens_users_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE
);
