CREATE TABLE "password-reset"
(
    id      SERIAL PRIMARY KEY,
    userid  INTEGER      NOT NULL,
    created TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    code    VARCHAR(256) NOT NULL,
    CONSTRAINT "password-reset_users_id_fk"
        FOREIGN KEY (userid) REFERENCES users (id)
            ON DELETE CASCADE
);

CREATE UNIQUE INDEX "password-reset_code_uindex"
    ON "password-reset" (code);
