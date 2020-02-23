CREATE TABLE questions_join_answers -- aka the links table
(
    id                 SERIAL PRIMARY KEY,
    added              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    question_id        INTEGER     NOT NULL,
    answer_id          INTEGER     NOT NULL,
    answer_is_solution BOOLEAN     NOT NULL DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES question (id)
        ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers (id)
        ON DELETE CASCADE
)
