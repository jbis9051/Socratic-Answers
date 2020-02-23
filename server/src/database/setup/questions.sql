CREATE TABLE question
(
    id               SERIAL PRIMARY KEY,
    creator_id       INTEGER               NOT NULL,
    creator_username VARCHAR(256)          NOT NULL,
    site_id          INTEGER               NOT NULL,
    title            VARCHAR(256)          NOT NULL,
    content          TEXT    DEFAULT NULL  NULL,
    answers          INTEGER DEFAULT 0     NOT NULL,
    score            INTEGER DEFAULT 0     NOT NULL,
    deleted          BOOLEAN DEFAULT FALSE NOT NULL,
    created          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    tag_string       VARCHAR(256)          NULL,
    solutions        INTEGER DEFAULT 0     NOT NULL,
    last_modified    TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT question_sites_id_fk
        FOREIGN KEY (site_id) REFERENCES sites (id),
    CONSTRAINT question_users_id_fk
        FOREIGN KEY (creator_id) REFERENCES users (id)
            ON UPDATE CASCADE
);
