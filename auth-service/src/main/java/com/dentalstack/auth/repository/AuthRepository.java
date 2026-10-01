package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.patient.UserType;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthRepository extends JpaRepository<Auth, Long> {
    Optional<Auth> findByEmailAndUserType(String email, UserType userType);

    Optional<Auth> findByEmailAndUserTypeAndStatusIn(String email, UserType userType, List<AuthStatus> statuses);

    Optional<Auth> findByEmailAndMobileNoAndUserTypeAndStatusIn(
            String email, String mobileNo, UserType userType, List<AuthStatus> statuses);

    Optional<Auth> findByMobileNoAndUserTypeAndStatus(String mobileNo, UserType userType, AuthStatus statuses);

    Optional<Auth> findByMobileNoAndUserTypeAndStatusIn(String mobileNo, UserType userType, List<AuthStatus> statuses);

    Optional<Auth> findByEmail(String email);

    List<Auth> findAllByEmail(String email);

    @Query(
            "SELECT au FROM Auth au WHERE au.email = :email AND au.userType = :userType AND au.organizationId = :organizationId AND au.xOrganizationName = :xOrganizationName AND au.status IN :statuses")
    Optional<Auth> findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
            @Param("email") String email,
            @Param("userType") UserType userType,
            @Param("organizationId") Long organizationId,
            @Param("xOrganizationName") String xOrganizationName,
            @Param("statuses") List<AuthStatus> statuses);

    @Query(
            "SELECT au FROM Auth au WHERE au.email = :email AND au.userType = :userType AND au.organizationId = :organizationId AND au.status IN :statuses")
    Optional<Auth> findByEmailAndUserTypeAndOrganizationIdAndStatusIN(
            @Param("email") String email,
            @Param("userType") UserType userType,
            @Param("organizationId") Long organizationId,
            @Param("statuses") List<AuthStatus> statuses);

    @Query(
            "SELECT au FROM Auth au WHERE au.email = :email AND au.organizationId = :organizationId AND au.xOrganizationName = :xOrganizationName")
    Optional<Auth> findByEmailAndOrganizationIdAndXOrganizationName(
            @Param("email") String email,
            @Param("organizationId") Long organizationId,
            @Param("xOrganizationName") String xOrganizationName);

    @Query("SELECT au FROM Auth au WHERE au.email = :email AND  au.xOrganizationName = :xOrganizationName")
    List<Auth> findMatchingByEmailAndXOrganizationName(
            @Param("email") String email, @Param("xOrganizationName") String xOrganizationName);

    @Query(
            "SELECT au FROM Auth au WHERE au.email = :email AND au.userType = :userType AND au.organizationId = :organizationId AND au.xOrganizationName = :xOrganizationName")
    Optional<Auth> findByEmailAndUserTypeAndOrganizationIdAndXOrganizationName(
            @Param("email") String email,
            @Param("userType") UserType userType,
            @Param("organizationId") Long organizationId,
            @Param("xOrganizationName") String xOrganizationName);

    Optional<Auth> findByMobileNoAndStatus(String mobileNo, AuthStatus authStatus);

    Optional<Auth> findByMobileNo(String mobileNo);

    Optional<Auth> findByUuid(String uuid);

    @Query("SELECT a FROM Auth a WHERE a.brandName = :brandName AND a.id > :lastUserId ORDER BY a.id ASC")
    List<Auth> findByBrandNameAndUserIdGreaterThanOrderByUserIdAsc(
            @Param("brandName") String brandName, @Param("lastUserId") Long lastUserId);

    @Query("SELECT COUNT(a) FROM Auth a WHERE a.brandName = :brandName")
    Long countByBrandName(@Param("brandName") String brandName);

    @Query("SELECT COUNT(a) FROM Auth a WHERE a.brandName = :brandName AND a.userId > :lastUserId")
    Long countByBrandNameAndUserIdGreaterThan(
            @Param("brandName") String brandName, @Param("lastUserId") Long lastUserId);

    Optional<Auth> findByEmailAndUuid(String email, String uuid);
}
