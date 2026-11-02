// backend/src/main/java/com/airetia/config/WebConfig.java
package com.airetia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC Web設定
 *
 * CORS設定（MVC レベル）。
 * SecurityConfig にも CORS 設定があり、Spring Security フィルターチェーンで先に評価される。
 * 両方を設定することで、Security 管理外のエンドポイント（/actuator 等）にも CORS が適用される。
 *
 * 許可オリジン → application.yml の airetia.security.allowed-origins と同期すること。
 * → 06_infrastructure.md §3.2 環境変数
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://airetia.com",
                "https://staging.airetia.com"
            )
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
