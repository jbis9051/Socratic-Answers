CREATE TABLE question
(
    id            serial PRIMARY KEY,
    creator_id    INTEGER               NOT NULL,
    site_id       INTEGER               NOT NULL,
    title         VARCHAR(256)          NOT NULL,
    content       TEXT    DEFAULT NULL  NULL,
    deleted       BOOLEAN DEFAULT FALSE NOT NULL,
    created       TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    answered      BOOLEAN DEFAULT FALSE NOT NULL,
    last_modified TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    CONSTRAINT question_sites_id_fk
        FOREIGN KEY (site_id) REFERENCES sites (id),
    CONSTRAINT question_users_id_fk
        FOREIGN KEY (creator_id) REFERENCES users (id)
            ON DELETE CASCADE
);
