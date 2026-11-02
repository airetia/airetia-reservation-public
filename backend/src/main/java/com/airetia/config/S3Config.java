// backend/src/main/java/com/airetia/config/S3Config.java
package com.airetia.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * AWS S3 設定
 * → 04_backend_specification.md §7 ファイルアップロード実装
 *
 * 認証情報は DefaultCredentialsProvider により以下の順で解決:
 *   1. 環境変数 (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
 *   2. EC2 IAM ロール（本番）
 *   3. ~/.aws/credentials（ローカル開発）
 */
@Configuration
public class S3Config {

    @Value("${aws.region:ap-northeast-1}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }

    /**
     * 署名付き URL 生成用（プロバイダー書類の閲覧に使用）
     * → 03_common_specification.md §5 GET /api/v1/providers/{id}/documents
     */
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
            .region(Region.of(region))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }
}
