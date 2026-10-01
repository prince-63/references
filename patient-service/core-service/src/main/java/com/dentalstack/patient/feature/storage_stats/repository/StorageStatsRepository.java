package com.dentalstack.patient.feature.storage_stats.repository;

import com.dentalstack.patient.feature.storage_stats.entity.StorageStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StorageStatsRepository extends JpaRepository<StorageStats, Long> {}
