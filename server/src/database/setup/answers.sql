CREATE TABLE answers
(
    id                  SERIAL PRIMARY KEY,
    creator_id          INTEGER               NOT NULL,
    creator_username    VARCHAR(256)          NOT NULL,
    site_id             INTEGER               NOT NULL,
    initial_question_id INTEGER               NULL,
    content             TEXT    DEFAULT NULL  NULL,
    score               INTEGER DEFAULT 0     NOT NULL,
    deleted             BOOLEAN DEFAULT FALSE NOT NULL,
    created             TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    last_modified       TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT answers_sites_id_fk
        FOREIGN KEY (site_id) REFERENCES sites (id),
    CONSTRAINT question_users_id_fk
        FOREIGN KEY (creator_id) REFERENCES users (id)
            ON UPDATE CASCADE,
    CONSTRAINT answer_question_id_fk
        FOREIGN KEY (initial_question_id) REFERENCES question (id)
            ON UPDATE CASCADE
);

CREATE INDEX ON answers (score DESC);
