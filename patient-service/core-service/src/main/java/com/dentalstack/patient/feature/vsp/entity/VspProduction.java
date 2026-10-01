package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;
import com.dentalstack.patient.global.entity.NewBaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "vsp_production",
        indexes = {
            @Index(name = "IX_vsp_production_vsp_order_id", columnList = "vsp_order_id"),
            @Index(name = "IX_vsp_production_status", columnList = "status")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspProduction extends NewBaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_order_id", nullable = false)
    @ToString.Exclude
    private VspOrder vspOrder;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VspProductionStatus status;

    @Builder.Default
    @Column(nullable = false)
    private int intermediateSplintQty = 0;

    @Builder.Default
    @Column(nullable = false)
    private int finalSplintQty = 0;

    @Builder.Default
    @Column(nullable = false)
    private int dentalArchesUpperQty = 0;

    @Builder.Default
    @Column(nullable = false)
    private int dentalArchesLowerQty = 0;

    @Builder.Default
    @Column(nullable = false)
    private int othersCustomQty = 0;

    @Column(columnDefinition = "TEXT")
    private String productionNotes;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "vsp_production_stl_files",
            joinColumns = @JoinColumn(name = "vsp_production_id"),
            inverseJoinColumns = @JoinColumn(name = "file_id"))
    @Builder.Default
    @ToString.Exclude
    private List<File> stlFiles = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_id")
    @ToString.Exclude
    private VspProductionShipping shipping;

    public int getTotalItems() {
        return intermediateSplintQty + finalSplintQty + dentalArchesUpperQty + dentalArchesLowerQty + othersCustomQty;
    }
}
