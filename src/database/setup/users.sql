CREATE TABLE users
(
    id              INTEGER AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(255)                         NOT NULL,
    email           VARCHAR(255)                         NOT NULL,
    password        VARCHAR(255)                         NOT NULL,
    created         DATETIME   DEFAULT CURRENT_TIMESTAMP NULL,
    bio             MEDIUMTEXT DEFAULT NULL              NULL,
    reputation      INTEGER    DEFAULT 0                 NOT NULL,
    profile_image   VARCHAR(255)                         NULL,
    email_confirmed BOOLEAN    DEFAULT FALSE             NOT NULL
);

CREATE UNIQUE INDEX users_email_uindex
    ON users (email);

CREATE UNIQUE INDEX users_id_uindex
    ON users (id);
