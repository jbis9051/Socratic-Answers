CREATE TABLE question
(
    id            INTEGER AUTO_INCREMENT PRIMARY KEY,
    creator_id    INTEGER                              NOT NULL,
    site_id       INTEGER                              NOT NULL,
    title         VARCHAR(256)                         NOT NULL,
    content       MEDIUMTEXT DEFAULT NULL              NULL,
    deleted       BOOLEAN    DEFAULT FALSE             NOT NULL,
    created       DATETIME   DEFAULT CURRENT_TIMESTAMP NULL,
    answered      BOOLEAN    DEFAULT FALSE             NOT NULL,
    last_modified DATETIME   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT question_sites_id_fk
        FOREIGN KEY (site_id) REFERENCES sites (id),
    CONSTRAINT question_users_id_fk
        FOREIGN KEY (creator_id) REFERENCES users (id)
            ON DELETE CASCADE
);
