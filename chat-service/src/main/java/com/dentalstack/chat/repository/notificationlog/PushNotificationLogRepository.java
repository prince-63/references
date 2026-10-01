package com.dentalstack.chat.repository.notificationlog;

import com.dentalstack.chat.entity.notificationlog.PushNotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PushNotificationLogRepository extends JpaRepository<PushNotificationLog, Long> {}
