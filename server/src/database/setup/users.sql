CREATE TABLE users
(
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(255)          NOT NULL,
    email           VARCHAR(255)          NOT NULL,
    password        VARCHAR(255)          NOT NULL,
    created         TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    bio             TEXT    DEFAULT NULL  NULL,
    reputation      INTEGER DEFAULT 0     NOT NULL,
    profile_image   VARCHAR(255)          NULL,
    email_confirmed BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE UNIQUE INDEX users_email_uindex
    ON users (email);

CREATE UNIQUE INDEX users_id_uindex
    ON users (id);
