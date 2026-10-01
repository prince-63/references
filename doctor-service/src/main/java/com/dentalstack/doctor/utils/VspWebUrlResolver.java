package com.dentalstack.doctor.utils;

public class VspWebUrlResolver {
    private static final String baseUrl = "https://cases.routetosmile.com/";

    public static String getCustomerInvitationUrl(String invitationCode) {
        return baseUrl + invitationCode + "/connect";
    }
}
