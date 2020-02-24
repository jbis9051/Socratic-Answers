CREATE TABLE question_edit_history
(
    id                SERIAL PRIMARY KEY,
    content           TEXT                  DEFAULT NULL NULL,
    tag_string        VARCHAR(256) NOT NULL,
    modification_date TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    editor_id         INTEGER      NOT NULL,
    editor_username   VARCHAR(256) NOT NULL
)
