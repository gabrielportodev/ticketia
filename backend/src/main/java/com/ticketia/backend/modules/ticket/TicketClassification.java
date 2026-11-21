package com.ticketia.backend.modules.ticket;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.Generated;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import tools.jackson.databind.JsonNode;

@Entity
@Table(name = "ticket_classifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketClassification {

    @Id
    private UUID protocol;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "protocol")
    private TicketEntity ticket;

    @Generated
    @Column(name = "recorded_at", nullable = false, insertable = false, updatable = false)
    private Instant recordedAt;

    @Column(name = "schema_version", nullable = false)
    private int schemaVersion = 1;

    @Column(name = "model_id", nullable = false)
    private String modelId;

    @Column(name = "prompt_version", nullable = false)
    private String promptVersion;

    private String category;
    private String priority;
    private String subject;

    @Column(name = "requires_review")
    private Boolean requiresReview;

    @Column(name = "review_reason")
    private String reviewReason;

    TicketClassification(TicketEntity ticket, String modelId, String promptVersion,
            JsonNode result, String reviewReason) {
        this.ticket = ticket;
        this.modelId = modelId;
        this.promptVersion = promptVersion;
        this.reviewReason = reviewReason;
        if (result != null) {
            category = result.get("category").asString();
            priority = result.get("priority").asString();
            subject = result.get("subject").asString();
            requiresReview = result.get("requires_review").asBoolean();
        }
    }
}
