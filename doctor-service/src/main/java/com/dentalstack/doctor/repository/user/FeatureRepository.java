package com.dentalstack.doctor.repository.user;

import com.dentalstack.doctor.entity.user.Feature;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, Long> {

    Optional<Feature> findByName(String name);
}
