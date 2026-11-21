CREATE TABLE ticket_outbox (
    event_id UUID PRIMARY KEY,
    protocol UUID NOT NULL UNIQUE REFERENCES tickets (protocol),
    occurred_at TIMESTAMPTZ NOT NULL,
    published_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ
);

CREATE INDEX ticket_outbox_pending_idx ON ticket_outbox (occurred_at, event_id)
    WHERE published_at IS NULL;
