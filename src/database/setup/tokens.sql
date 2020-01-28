CREATE TABLE tokens
(
    id      SERIAL PRIMARY KEY,
    user_id INT                                NOT NULL,
    token   VARCHAR(256)                       NOT NULL,
    created TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT tokens_users_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE
);
