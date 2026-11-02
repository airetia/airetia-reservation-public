package com.airetia;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGeneratorTest {

    @Test
    void generateAdminPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String rawPassword = "Admin1234!";
        String encodedPassword = encoder.encode(rawPassword);

        System.out.println("===== BCrypt Hash =====");
        System.out.println(encodedPassword);
        System.out.println("=======================");
    }
}
