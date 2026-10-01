package com.dentalstack.patient.feature.location.repository;

import com.dentalstack.patient.feature.location.entity.Location;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query(value = "SELECT DISTINCT country_name FROM locations", nativeQuery = true)
    List<String> findUniqueCountryNames();

    @Query(value = "SELECT DISTINCT state_name FROM locations WHERE country_name = :countryName", nativeQuery = true)
    List<String> findDistinctStatesByCountry(String countryName);

    @Query(
            value = "SELECT DISTINCT name FROM locations WHERE country_name = :countryName AND state_name = :stateName",
            nativeQuery = true)
    List<String> findDistinctCitiesByStateAndCountry(String countryName, String stateName);
}
