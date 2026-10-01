package com.dentalstack.patient.global.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@MappedSuperclass
@EqualsAndHashCode
public class NewBaseEntity implements Serializable {

    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private String id;

    @Column(name = "created_at")
    @CreationTimestamp
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        this.id = generateUniqueId(10);
    }

    private String generateUniqueId(int size) {
        return UUID.randomUUID().toString().replace("-", "").substring(0, size);
    }
}
