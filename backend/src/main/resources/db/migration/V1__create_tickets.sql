CREATE TABLE tickets (
    protocol UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_TRIAGE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    department TEXT
);
