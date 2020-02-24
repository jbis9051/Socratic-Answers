CREATE TABLE answer_edit_history
(
    id                SERIAL PRIMARY KEY,
    content           TEXT                  DEFAULT NULL NULL,
    modification_date TIMESTAMPTZ  NOT NULL DEFAULT now(),
    editor_id         INTEGER      NOT NULL,
    editor_username   VARCHAR(256) NOT NULL,
    answer_id         INTEGER      NOT NULL,
    FOREIGN KEY (answer_id) REFERENCES answers (id)
        ON DELETE CASCADE
)

