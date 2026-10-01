package com.dentalstack.chat.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.dentalstack.chat.config.AwsCredentialManager;
import com.dentalstack.chat.dto.s3.Feature;
import com.dentalstack.chat.exception.ExceptionPrinter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileService {

    private final AwsS3Service awsS3Service;

    @Autowired
    private AwsCredentialManager awsCredentialManager;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.s3.bucket.region}")
    private String s3BucketRegion;

    /**
     * Upload objects in parts�Using the Multipart upload API you can upload large
     * objects, up to 5 TB.
     *
     * @param multipartFile
     * @param feature       - Enum object which tells upload request for which
     *                      feature e.g profile,alignerJourney,chat etc.
     * @return
     */
    public String uploadFile(MultipartFile multipartFile, Feature feature, String id) {

        try {

            AmazonS3 s3Client = this.awsCredentialManager.getAmazonS3Client();

            String folderPath = getFileDirectory(feature);
            folderPath = folderPath + "/" + id;

            if (!this.awsS3Service.isBucketExist(s3Client, this.bucketName)) {
                if (!this.awsS3Service.createBucket(s3Client, this.bucketName)) {
                    return "fail";
                }
            }

            if (!this.awsS3Service.isObjectExist(this.bucketName, folderPath, s3Client)) {
                if (!this.awsS3Service.createFolder(this.bucketName, folderPath, s3Client)) {
                    return "fail";
                }
            }

            File file = convertMultiPartToFile(multipartFile);
            // InputStream targetStream = new FileInputStream(file); // comment by vishnu
            awsS3Service.uploadFile(this.bucketName, folderPath, file, s3Client);
            ObjectMetadata md = new ObjectMetadata();
            // md.setContentLength(contentAsBytes.length);

            String fileName = file.getName();
            String[] fileSplitArray = fileName.split("\\.", 2);
            String fileType = fileSplitArray[fileSplitArray.length - 1];
            if (Stream.of("jpg", "jpeg", "png", "gif", "tiff", "webp", "psd").anyMatch(fileType::equalsIgnoreCase)) {
                md.setContentType("image/jpeg");
            } else if (Stream.of("pdf", "ps").anyMatch(fileType::equalsIgnoreCase)) {
                md.setContentType("application/pdf");
            } else if (Stream.of("doc", "docx").anyMatch(fileType::equalsIgnoreCase)) {
                md.setContentType("application/msword");
            }

            String fileNameNew = "";
            fileNameNew = awsS3Service.generateFileDownloadUrl(
                    this.s3BucketRegion, this.bucketName, folderPath, file.getName());
            return fileNameNew;

        } catch (AmazonServiceException e) {
            // The call was transmitted successfully, but Amazon S3 couldn't process it, so
            // it returned an error response.
            ExceptionPrinter.printWarningLogs(e, this.getClass().getName());
        } catch (SdkClientException e) {
            // Amazon S3 couldn't be contacted for a response, or the client couldn't parse
            // the response from Amazon S3.
            ExceptionPrinter.printWarningLogs(e, this.getClass().getName());
        } catch (Exception e) {
            ExceptionPrinter.printWarningLogs(e, this.getClass().getName());
        }
        return "fail";
    }

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String[] prefixAndSuffix = extractPrefixAndSuffix(originalFilename);

        // The prefix will be at index 0, and the suffix will be at index 1
        String prefix = prefixAndSuffix[0];
        if (prefix.length() <= 4) {
            prefix = "Image" + prefix;
        }
        String suffix = "." + prefixAndSuffix[1];
        // File convFile = new File(file.getOriginalFilename());
        File convFile = File.createTempFile(prefix, suffix);

        try (OutputStream outputStream = new FileOutputStream(convFile)) {
            outputStream.write(file.getBytes());
        } catch (IOException e) {
            // Handle any exceptions that may occur during the conversion
            throw e;
        }
        return convFile;
    }

    public static String[] extractPrefixAndSuffix(String filename) {
        // Get the last occurrence of the dot (.) character to split the prefix and
        // suffix
        int lastDotIndex = filename.lastIndexOf(".");

        String prefix, suffix;
        if (lastDotIndex >= 0) {
            // Extract the prefix and suffix from the original filename
            prefix = filename.substring(0, lastDotIndex);
            suffix = filename.substring(lastDotIndex + 1);
        } else {
            // If there is no dot (.) in the filename, treat the entire filename as the
            // prefix and no suffix
            prefix = filename;
            suffix = "";
        }

        // Return the prefix and suffix as an array of strings
        return new String[] {prefix, suffix};
    }

    private String getFileDirectory(Feature feature) {
        switch (feature) {
            case DOCTOR_PROFILE:
                return "doctor/profile";
            case PATIENT_PROFILE:
                return "patient/profile";
            case HealthCareRecord:
                return "healthCareRecord";
            case ReportBug:
                return "reportBug";
            case Faq:
                return "faq";
            case Chat:
                return "chat";
            case Blog:
                return "blog";
            case AlignerJourney:
                return "alignerJourney";
            default:
                break;
        }
        return "dentalstack";
    }
}
