CREATE TABLE "confirmation-emails"
(
    id      SERIAL PRIMARY KEY,
    userid  INTEGER      NOT NULL,
    created TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    email   VARCHAR(256) NOT NULL,
    code    VARCHAR(256) NOT NULL,
    CONSTRAINT "confirmation-emails_users_id_fk"
        FOREIGN KEY (userid) REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE UNIQUE INDEX "confirmation-emails_code_uindex"
    ON "confirmation-emails" (code);
