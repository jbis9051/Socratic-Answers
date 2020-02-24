CREATE TABLE question_edit_history
(
    id                SERIAL PRIMARY KEY,
    title             VARCHAR(256) NOT NULL,
    content           TEXT                  DEFAULT NULL NULL,
    tag_string        VARCHAR(256) NOT NULL,
    modification_date TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    editor_id         INTEGER      NOT NULL,
    editor_username   VARCHAR(256) NOT NULL,
    question_id       INTEGER      NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question (id)
        ON DELETE CASCADE
)
