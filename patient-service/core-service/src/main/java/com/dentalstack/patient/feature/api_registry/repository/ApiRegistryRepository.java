package com.dentalstack.patient.feature.api_registry.repository;

import com.dentalstack.patient.feature.api_registry.entity.ApiRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiRegistryRepository extends JpaRepository<ApiRegistry, Long> {

    ApiRegistry findByPathAndMethod(String path, String method);

    @Modifying
    @Query("UPDATE ApiRegistry a SET a.hitCount = a.hitCount + :count WHERE a.path = :path AND a.method = :method")
    void incrementHitCount(@Param("path") String path, @Param("method") String method, @Param("count") long count);
}
