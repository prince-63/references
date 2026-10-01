package com.dentalstack.chat.service.email.impl;

import com.dentalstack.chat.service.email.EmailService;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

@Service
@Slf4j
@Profile("prod")
public class ProdEmailServiceImpl implements EmailService {
    @Value("${zepto-mail.api-url}")
    private String zeptoMailApiUrl;

    @Value("${zepto-mail.api-key}")
    private String zeptoMailApiKey;

    private WebClient webClient;

    private WebClient primaryWebClient;
    private WebClient secondaryWebClient;

    @Value("${zepto-craft-align-mail.api-url}")
    private String zeptoMailCraftAlignApiUrl;

    @Value("${zepto-craft-align-mail.api-key}")
    private String zeptoMailCraftAlignApiKey;

    @PostConstruct
    public void init() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                .responseTimeout(Duration.ofSeconds(30))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(30)).addHandlerLast(new WriteTimeoutHandler(30)));

        this.primaryWebClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(zeptoMailApiUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Authorization", "Zoho-enczapikey " + zeptoMailApiKey)
                .build();

        this.secondaryWebClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(zeptoMailCraftAlignApiUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Zoho-enczapikey " + zeptoMailCraftAlignApiKey)
                .build();
    }

    @Override
    public String sendEmail(JSONObject emailContent) {
        try {
            if (emailContent == null) {
                log.info("Skipped: Invalid email content");
                return "Skipped: Invalid email content";
            }

            return primaryWebClient
                    .post()
                    .bodyValue(emailContent.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnError(error -> log.error("Error sending email: {}", error.getMessage()))
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)).maxBackoff(Duration.ofSeconds(5)))
                    .block(Duration.ofSeconds(30));
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public String sendEmail(JSONObject emailContent, boolean useSecondary) {
        try {
            if (emailContent == null) {
                log.info("Skipped: Invalid email content");
                return "Skipped: Invalid email content";
            }
            WebClient client = useSecondary ? secondaryWebClient : primaryWebClient;

            return client.post()
                    .bodyValue(emailContent.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnError(error -> log.error("Error sending email: {}", error.getMessage()))
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)).maxBackoff(Duration.ofSeconds(5)))
                    .block(Duration.ofSeconds(30));
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public JSONObject createEmailJSONObject(
            String toAddress, JSONObject mergeInfo, String templateKey, String orgName) {
        JSONObject object = new JSONObject();
        object.put("mail_template_key", templateKey);
        if ("CRAFTALIGN".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "smile@craftalign.com").put("name", "CraftAlign"));
        } else if ("ROUTETOSMILE".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@routetosmile.com").put("name", "RouteToSmile"));
        } else if ("ROUTETOSMILEVSP".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@routetosmile.com").put("name", "RouteToSmile Vsp"));
        } else if ("SYNAPSE".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject()
                            .put("address", "support@synapsehealthtech.in")
                            .put("name", "SynapseHealthTech"));
        } else if ("SMILEZY".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@smilezy.com").put("name", "Smilezy"));
        } else if ("ALIGNEAZY".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@dental-stack.com").put("name", "AlignEazy"));
        } else if ("AMEND".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@dental-stack.com").put("name", "Amend"));
        } else if ("SMILEXCEL".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "apps@smilexcel.com").put("name", "Smilexcel Aligner"));
        } else if ("EVOLVALIGN".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@dental-stack.com").put("name", "EvolvAlign"));
        } else if ("CLEARCASTLE".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "apps@clearcastle.in").put("name", "Clear Castle"));
        } else if ("AIIQALIGNER".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "aiiq@aiiqaligner.com").put("name", "Aiiq Aligner"));
        } else if ("CONFIDENTALIGNER".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@confidentlab.com").put("name", "Confident Aligner"));
        } else {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@dental-stack.com").put("name", "Dental Stack"));
        }
        object.put(
                "to",
                new JSONArray().put(new JSONObject().put("email_address", new JSONObject().put("address", toAddress))));
        object.put("merge_info", mergeInfo);
        return object;
    }

    @Override
    public JSONObject createEmailJSONObjectForSpecificOrgName(
            String toAddress, JSONObject mergeInfo, String templateKey, String orgName) {
        JSONObject object = new JSONObject();
        object.put("mail_template_key", templateKey);

        if ("CLEARCASTLE".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "apps@clearcastle.in").put("name", "Clear Castle"));
        } else if ("SYNAPSE".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject()
                            .put("address", "support@synapsehealthtech.in")
                            .put("name", "SynapseHealthTech"));
        } else if ("SMILEXCEL".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "apps@smilexcel.com").put("name", "Smilexcel Aligner"));
        } else if ("SMILEZY".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@smilezy.com").put("name", "Smilezy"));
        } else if ("AMEND".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@dental-stack.com").put("name", "Amend"));
        } else if ("AIIQALIGNER".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "aiiq@aiiqaligner.com").put("name", "Aiiq Aligner"));
        } else if ("CONFIDENTALIGNER".equalsIgnoreCase(orgName)) {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@confidentlab.com").put("name", "Confident Aligner"));
        } else {
            object.put(
                    "from",
                    new JSONObject().put("address", "noreply@dental-stack.com").put("name", orgName));
        }
        object.put("mail_template_key", templateKey);

        object.put(
                "to",
                new JSONArray().put(new JSONObject().put("email_address", new JSONObject().put("address", toAddress))));
        object.put("merge_info", mergeInfo);
        return object;
    }

    @Override
    public JSONObject addAttachment(JSONObject emailContent, MultipartFile file, String attachmentName) {
        try {
            if (emailContent == null || file == null || file.isEmpty()) {
                return emailContent;
            }

            JSONObject attachment = new JSONObject();
            attachment.put("content", Base64.getEncoder().encodeToString(file.getBytes()));
            attachment.put("name", attachmentName != null ? attachmentName : file.getOriginalFilename());
            attachment.put("mime_type", file.getContentType());

            emailContent.put("attachments", new JSONArray().put(attachment));

            return emailContent;

        } catch (Exception e) {
            log.error("Failed to add attachment", e);
            throw new RuntimeException("Failed to add attachment", e);
        }
    }
}
