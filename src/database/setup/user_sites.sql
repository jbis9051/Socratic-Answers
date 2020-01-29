CREATE TABLE user_sites
(
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER     NOT NULL,
    site_id      INTEGER     NOT NULL,
    reputation   INTEGER              DEFAULT 0 NOT NULL,
    is_moderator BOOLEAN     NOT NULL,
    created      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_sites_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT user_sites_site_id_fk
        FOREIGN KEY (site_id) REFERENCES sites (id)
)
