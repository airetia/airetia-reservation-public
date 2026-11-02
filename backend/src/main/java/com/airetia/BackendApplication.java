// backend/src/main/java/com/airetia/BackendApplication.java
package com.airetia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * airetia バックエンドアプリケーション エントリポイント
 *
 * @EnableAsync     - EmailService の @Async メソッドを有効化
 * @EnableScheduling - BatchConfig の @Scheduled バッチを有効化
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
