package com.dentalstack.chat.repository;

import com.dentalstack.chat.entity.WebNotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<WebNotification, Long> {

    //
    //	 @Query("SELECT n FROM WebNotification n WHERE n.doctorId = :doctorId ORDER BY n.createdDate DESC")
    //	    List<WebNotification> findTop10ByDoctorIdOrderByCreatedDateDesc(Long doctorId);

    List<WebNotification> findTop10ByDoctorIdAndActiveTrueOrderByCreatedAtDesc(Long doctorId);
}
