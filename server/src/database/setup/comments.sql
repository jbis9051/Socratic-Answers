CREATE TABLE comments
(
    id      SERIAL PRIMARY KEY,
    qa_id   INTEGER      NOT NULL,
    user_id INTEGER      NOT NULL,
    username VARCHAR(256) NOT NULL,
    content VARCHAR(256) NOT NULL,
    created TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT comments_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT comments_qa_id_fk
        FOREIGN KEY (qa_id) REFERENCES questions_join_answers (id)

)
