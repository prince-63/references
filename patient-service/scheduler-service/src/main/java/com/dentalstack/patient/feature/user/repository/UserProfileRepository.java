package com.dentalstack.patient.feature.user.repository;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.ProfileStatus;
import com.dentalstack.patient.feature.user.enums.ProfileType;
import feign.Param;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH ip.user ipu "
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findByIdWithOrgAndDoctorAndUser(@Param("profileId") Long profileId);

    @Query("SELECT u FROM UserProfile u LEFT JOIN FETCH u.roles WHERE u.id = :profileId")
    Optional<UserProfile> findByIdWithRoles(@Param("profileId") Long profileId);

    @Query("SELECT DISTINCT up FROM UserProfile up " + "JOIN FETCH up.user u "
            + "JOIN FETCH up.roles r "
            + "WHERE r.name IN :roleNames "
            + "AND up.status = :status "
            + "AND up.profileType = :profileType")
    Stream<UserProfile> findAllByRolesAndStatusInBatches(
            @Param("roleNames") Set<String> roleNames,
            @Param("status") ProfileStatus status,
            @Param("profileType") ProfileType profileType);
}
