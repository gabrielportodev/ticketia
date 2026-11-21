CREATE TABLE ticket_classifications (
    protocol UUID PRIMARY KEY REFERENCES tickets (protocol),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    schema_version INTEGER NOT NULL,
    model_id TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    category TEXT,
    priority TEXT,
    subject TEXT,
    requires_review BOOLEAN,
    review_reason TEXT,
    CONSTRAINT classification_outcome CHECK (
        (category IS NULL AND priority IS NULL AND subject IS NULL AND requires_review IS NULL
            AND review_reason IS NOT DISTINCT FROM 'INVALID_RESPONSE')
        OR (category IS NOT NULL AND priority IS NOT NULL AND subject IS NOT NULL AND requires_review IS NOT NULL
            AND ((requires_review AND review_reason IS NOT DISTINCT FROM 'MODEL_REQUESTED_REVIEW')
                OR (NOT requires_review AND review_reason IS NULL)))
    )
);
