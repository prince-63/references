package com.dentalstack.doctor.dto.responsebuilder;

import java.util.List;

public class DataDTO implements DTO {
    @SuppressWarnings("unused")
    private static final long serialVersionUID = 1L;

    private List<Object> results;

    public List<Object> getResults() {
        return results;
    }

    public void setResults(List<Object> results) {
        this.results = results;
    }
}
