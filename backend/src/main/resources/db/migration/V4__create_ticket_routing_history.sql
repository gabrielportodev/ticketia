CREATE TABLE ticket_routing_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    protocol UUID NOT NULL REFERENCES tickets (protocol),
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL,
    previous_department TEXT,
    new_department TEXT NOT NULL
);

CREATE INDEX ticket_routing_history_protocol_id ON ticket_routing_history (protocol, id DESC);
