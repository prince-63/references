package com.dentalstack.doctor.exception.practicelocation;

public class PracticeLocationNotFoundException extends RuntimeException {

    public PracticeLocationNotFoundException(Long practiceLocationId) {
        super(String.format("Practice location not found with id %d", practiceLocationId));
    }
}
