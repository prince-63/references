package com.dentalstack.doctor.entity.rbac;

import com.dentalstack.doctor.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(name = "module")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module extends BaseEntity {
    @NotNull
    private String name;

    private String description;

    //    @ManyToOne(fetch = FetchType.LAZY)
    //    @JoinColumn(name = "sub_role_id")
    //    private SubRole subRole;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<SubModule> subModules = new HashSet<>();
}
