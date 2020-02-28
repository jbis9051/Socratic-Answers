CREATE TABLE "question-comments"
(
    id          SERIAL PRIMARY KEY,
    question_id INTEGER      NOT NULL,
    user_id     INTEGER      NOT NULL,
    username    VARCHAR(256) NOT NULL,
    content     VARCHAR(256) NOT NULL,
    created     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT comments_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT comments_qa_id_fk
        FOREIGN KEY (question_id) REFERENCES question (id)

)
