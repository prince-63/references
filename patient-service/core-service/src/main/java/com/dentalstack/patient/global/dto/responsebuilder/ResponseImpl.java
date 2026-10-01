package com.dentalstack.patient.global.dto.responsebuilder;

public class ResponseImpl implements Response {
    private static final long serialVersionUID = 1L;

    private DTO data;
    private DTO meta;
    private DTO status;

    public DTO getData() {
        return data;
    }

    public void setData(DTO data) {
        this.data = data;
    }

    public DTO getMeta() {
        return meta;
    }

    public void setMeta(DTO meta) {
        this.meta = meta;
    }

    @Override
    public DTO getStatus() {
        return status;
    }

    @Override
    public void setStatus(DTO status) {
        this.status = status;
    }
}
