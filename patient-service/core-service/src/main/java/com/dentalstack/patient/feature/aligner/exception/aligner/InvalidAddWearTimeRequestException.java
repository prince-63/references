package com.dentalstack.patient.feature.aligner.exception.aligner;

public class InvalidAddWearTimeRequestException extends RuntimeException {
    public InvalidAddWearTimeRequestException(long wearDurationInSec, long secsTillNow) {
        super(String.format(
                "Daily wear time duration %d secs cannot be greater than time passed till now in a day which is %d secs",
                wearDurationInSec, secsTillNow));
    }
}
