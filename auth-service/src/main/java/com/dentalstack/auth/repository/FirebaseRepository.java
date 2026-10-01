package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.Firebase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FirebaseRepository extends JpaRepository<Firebase, Long> {
    Firebase findByEmail(String email);

    Firebase findByEmailAndToken(String email, String token);
}
