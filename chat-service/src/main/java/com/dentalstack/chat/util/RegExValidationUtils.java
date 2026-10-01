package com.dentalstack.chat.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jboss.logging.Logger;

public class RegExValidationUtils {

    static Logger logger = Logger.getLogger(RegExValidationUtils.class);

    static String validEmailRegex = "^(.+)@(.+)$";
    static String validMobileRegex = "-?\\d+(\\.\\d+)?";

    public static boolean isValidEmail(String email) {

        if (logger.isDebugEnabled()) logger.debug("In isValidEmail utility method " + "validating email " + email);

        Pattern pattern = Pattern.compile(validEmailRegex);
        Matcher matcher = pattern.matcher(email);

        if (logger.isDebugEnabled()) logger.debug(email + " : " + matcher.matches());
        return matcher.matches();
    }

    public static boolean isValidMobile(String mobile) {

        if (logger.isDebugEnabled()) logger.debug("In isValidMobile utility method " + "validating mobile " + mobile);

        Pattern pattern = Pattern.compile(validMobileRegex);
        Matcher matcher = pattern.matcher(mobile);

        if (logger.isDebugEnabled()) logger.debug(mobile + " : " + matcher.matches());
        return matcher.matches();
    }
}
