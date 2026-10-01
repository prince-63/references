package com.dentalstack.chat.dto.responsebuilder;

public class StatusDTO implements DTO {

    private String code;
    private String result;
    private String message;

    public StatusDTO() {
        super();
    }

    public StatusDTO(String code, String message) {
        super();
        this.code = code;
        this.message = message;
    }

    public StatusDTO(String result, String code, String message) {
        super();
        this.result = result;
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    @Override
    public String toString() {
        return "StatusDTO [code=" + code + ", result=" + result + ", message=" + message + "]";
    }
}
