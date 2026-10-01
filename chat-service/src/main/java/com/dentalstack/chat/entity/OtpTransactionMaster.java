package com.dentalstack.chat.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The persistent class for the user database table.
 *
 */
@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "otp_transaction_master")
public class OtpTransactionMaster implements Serializable {

    private static final long serialVersionUID = 65981149772133526L;

    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    private String mobileNo;

    private String emailId;

    private String otpNo;

    private boolean otpDeliveryStatus;

    private Long userId;

    private int userOtpAttempt;

    private Date createdDateTime;

    private Date expiryDateTime;

    private boolean otpUsed;

    private boolean active;
    private String countryCode;
}
