package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.entity.CoinTransaction;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, Long> {

    Page<CoinTransaction> findByPatientIdAndTransactionType(
            Long patientId, TransactionType transactionType, Pageable pageable);

    Page<CoinTransaction> findByPatientId(Long patientId, Pageable pageable);
}
