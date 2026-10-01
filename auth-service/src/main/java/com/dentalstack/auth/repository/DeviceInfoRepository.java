package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.DeviceInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceInfoRepository extends JpaRepository<DeviceInfo, Long> {
    void deleteByAuthId(Long id);
}
