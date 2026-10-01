package com.dentalstack.chat.repository;

import com.dentalstack.chat.entity.OtpTransactionMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpDetailsRepository extends JpaRepository<OtpTransactionMaster, Long> {
    OtpTransactionMaster findTopByEmailIdAndOtpUsedFalseOrderByIdDesc(String emailId);

    OtpTransactionMaster findTopByMobileNoAndOtpUsedFalseOrderByIdDesc(String mobileNo);
}
