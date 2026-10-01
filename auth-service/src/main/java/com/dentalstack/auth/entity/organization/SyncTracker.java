package com.dentalstack.auth.entity.organization;

import com.dentalstack.auth.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import lombok.*;

@Entity
@Table(name = "sync_tracker")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncTracker extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String orgName;

    @Column(nullable = false)
    private Long lastSyncedUserId;

    @Column(nullable = false)
    private ZonedDateTime lastSyncTime;
}
