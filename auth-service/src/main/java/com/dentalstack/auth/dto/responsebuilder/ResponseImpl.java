package com.dentalstack.auth.dto.responsebuilder;

public class ResponseImpl implements Response {
    private static final long serialVersionUID = 1L;

    private DTO data;
    private DTO meta;
    private DTO status;

    /**
     * @return the data
     */
    public DTO getData() {
        return data;
    }

    /**
     * @param data the data to set
     */
    public void setData(DTO data) {
        this.data = data;
    }

    /**
     * @return the meta
     */
    public DTO getMeta() {
        return meta;
    }

    /**
     * @param meta the meta to set
     */
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
