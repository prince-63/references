package com.dentalstack.chat.dto.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailForAlignerRelated {

    private String doctorFirstName;
    private String doctorLastName;
    private String patientFirstName;
    private String doctorEmail;
}
