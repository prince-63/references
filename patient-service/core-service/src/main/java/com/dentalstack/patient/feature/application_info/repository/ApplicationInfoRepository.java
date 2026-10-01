package com.dentalstack.patient.feature.application_info.repository;

import com.dentalstack.patient.feature.application_info.entity.ApplicationInfo;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationInfoRepository extends JpaRepository<ApplicationInfo, Long> {

    @Query("SELECT ai FROM ApplicationInfo ai WHERE ai.serviceName = :serviceName")
    ApplicationInfo findByServiceName(@Param("serviceName") String serviceName);
}
