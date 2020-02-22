CREATE TABLE users
(
    id                    SERIAL PRIMARY KEY,
    username              VARCHAR(256) NOT NULL,
    email                 VARCHAR(256) NOT NULL,
    password              VARCHAR(256) NOT NULL,
    last_changed_username TIMESTAMPTZ           DEFAULT NULL,
    created               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    bio                   TEXT                  DEFAULT 'This user is a ghost. 👻',
    location              VARCHAR(256)          DEFAULT NULL,
    website               VARCHAR(256)          DEFAULT NULL,
    github                VARCHAR(256)          DEFAULT NULL,
    profile_image         VARCHAR(256) NULL,
    email_confirmed       BOOLEAN               DEFAULT FALSE NOT NULL
);

CREATE UNIQUE INDEX users_email_uindex
    ON users (email);

CREATE UNIQUE INDEX users_id_uindex
    ON users (id);
