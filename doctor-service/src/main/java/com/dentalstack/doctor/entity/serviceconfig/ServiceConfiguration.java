package com.dentalstack.doctor.entity.serviceconfig;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.user.UserProfile;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "service_configurations")
@Getter
@Setter
@ToString(exclude = {"userProfile", "enabledItems", "disabledItems"})
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class ServiceConfiguration extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false, unique = true)
    private UserProfile userProfile;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "service_config_items",
            joinColumns = @JoinColumn(name = "service_config_id"),
            inverseJoinColumns = @JoinColumn(name = "service_item_id"))
    @Builder.Default
    private Set<ServiceItem> enabledItems = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "service_config_disabled_items",
            joinColumns = @JoinColumn(name = "service_config_id"),
            inverseJoinColumns = @JoinColumn(name = "service_item_id"))
    @Builder.Default
    private Set<ServiceItem> disabledItems = new HashSet<>();
}
