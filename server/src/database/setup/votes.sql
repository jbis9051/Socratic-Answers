CREATE TABLE votes
(
    id      SERIAL PRIMARY KEY,
    qa_id   INTEGER     NOT NULL,
    user_id INTEGER     NOT NULL,
    upvote  BOOLEAN     NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (qa_id, user_id),
    FOREIGN KEY (qa_id) REFERENCES questions_join_answers (id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
)
