package com.dentalstack.patient.global.dto.responsebuilder;

public interface Response {

    DTO getData();

    void setData(DTO data);

    void setStatus(DTO status);

    DTO getStatus();

    DTO getMeta();

    void setMeta(DTO meta);
}
