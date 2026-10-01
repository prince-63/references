package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.global.enums.language.Language;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ReminderTranslationUtil {
    private static final Map<Language, Map<String, String>> TRANSLATIONS = new HashMap<>();

    private static final String[] REMINDER_TYPES = {
        "Wear after breakfast", "Wear after lunch", "Wear after dinner", "Change Aligner"
    };

    static {
        Map<String, String> enTranslations = new HashMap<>();
        enTranslations.put("Wear after breakfast", "Wear after breakfast");
        enTranslations.put("Wear after lunch", "Wear after lunch");
        enTranslations.put("Wear after dinner", "Wear after dinner");
        enTranslations.put("Change Aligner", "Change Aligner");

        Map<String, String> esTranslations = new HashMap<>();
        esTranslations.put("Wear after breakfast", "Usar después del desayuno");
        esTranslations.put("Wear after lunch", "Usar después del almuerzo");
        esTranslations.put("Wear after dinner", "Usar después de la cena");
        esTranslations.put("Change Aligner", "Cambiar el alineador");

        Map<String, String> hiTranslations = new HashMap<>();
        hiTranslations.put("Wear after breakfast", "नाश्ते के बाद पहनें");
        hiTranslations.put("Wear after lunch", "दोपहर के भोजन के बाद पहनें");
        hiTranslations.put("Wear after dinner", "रात के खाने के बाद पहनें");
        hiTranslations.put("Change Aligner", "अलाइनर बदलें");

        Map<String, String> esReverse = new HashMap<>();
        esReverse.put("Usar después del desayuno", "Wear after breakfast");
        esReverse.put("Usar después del almuerzo", "Wear after lunch");
        esReverse.put("Usar después de la cena", "Wear after dinner");
        esReverse.put("Cambiar el alineador", "Change Aligner");

        Map<String, String> hiReverse = new HashMap<>();
        hiReverse.put("नाश्ते के बाद पहनें", "Wear after breakfast");
        hiReverse.put("दोपहर के भोजन के बाद पहनें", "Wear after lunch");
        hiReverse.put("रात के खाने के बाद पहनें", "Wear after dinner");
        hiReverse.put("अलाइनर बदलें", "Change Aligner");

        TRANSLATIONS.put(Language.ENGLISH, enTranslations);
        TRANSLATIONS.put(Language.SPANISH, esTranslations);
        TRANSLATIONS.put(Language.HINDI, hiTranslations);
    }

    public static String getTranslatedName(String dbValue, Language targetLanguage) {
        String reminderType = null;

        if (TRANSLATIONS.get(Language.ENGLISH).containsKey(dbValue)) {
            reminderType = dbValue;
        } else if (TRANSLATIONS.get(Language.SPANISH).containsValue(dbValue)) {
            for (Map.Entry<String, String> entry :
                    TRANSLATIONS.get(Language.SPANISH).entrySet()) {
                if (entry.getValue().equals(dbValue)) {
                    reminderType = entry.getKey();
                    break;
                }
            }
        } else if (TRANSLATIONS.get(Language.HINDI).containsValue(dbValue)) {
            for (Map.Entry<String, String> entry :
                    TRANSLATIONS.get(Language.HINDI).entrySet()) {
                if (entry.getValue().equals(dbValue)) {
                    reminderType = entry.getKey();
                    break;
                }
            }
        }

        if (reminderType != null) {
            return TRANSLATIONS.get(targetLanguage).get(reminderType);
        }

        return dbValue;
    }
}
