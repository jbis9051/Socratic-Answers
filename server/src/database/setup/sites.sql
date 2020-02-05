CREATE TABLE sites
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(256)               NULL,
    description VARCHAR(256) DEFAULT NULL  NULL,
    subdomain   VARCHAR(256)               NULL,
    parent_site INTEGER      DEFAULT NULL  NULL,
    is_meta   BOOLEAN      DEFAULT FALSE NOT NULL,
    created     TIMESTAMPTZ                NOT NULL DEFAULT NOW(),
    FOREIGN KEY (parent_site) REFERENCES sites (id)
        ON DELETE CASCADE
);
