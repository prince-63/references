package com.dentalstack.patient.global.config;

import java.time.ZoneId;
import java.util.TimeZone;

public final class TimezoneConfig {

    private TimezoneConfig() {}

    public static final String DEFAULT_TIMEZONE_ID = "Asia/Kolkata";

    public static final ZoneId DEFAULT_ZONE_ID = ZoneId.of(DEFAULT_TIMEZONE_ID);

    public static final TimeZone DEFAULT_TIMEZONE = TimeZone.getTimeZone(DEFAULT_ZONE_ID);
}
