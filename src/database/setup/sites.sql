CREATE TABLE sites
(
    id          INTEGER AUTO_INCREMENT,
    name        VARCHAR(256)                           NULL,
    description VARCHAR(256) DEFAULT NULL              NULL,
    subdomain   VARCHAR(256)                           NULL,
    parent_site INTEGER      DEFAULT NULL              NULL,
    created     DATETIME     DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT sites_pk
        PRIMARY KEY (id),
    FOREIGN KEY (parent_site) REFERENCES sites (id)
        ON DELETE CASCADE
);
