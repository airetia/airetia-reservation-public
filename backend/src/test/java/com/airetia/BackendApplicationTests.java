package com.airetia;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.airetia.repository.MemberRepository;

/**
 * Spring Boot アプリケーションのコンテキストロード確認テスト
 * 
 * - BackendApplication を明示的に指定して、Spring Boot コンテキストを起動
 * - MemberRepository が正しくロードされるか確認
 */
@SpringBootTest(classes = BackendApplication.class)
@TestPropertySource(locations = "classpath:application-test.properties")
public class BackendApplicationTests {

    @Autowired
    private MemberRepository memberRepository;

    /**
     * Spring コンテキストが正しくロードされ、リポジトリが DI されるか確認
     */
    @Test
    void contextLoads() {
        assertNotNull(memberRepository, "MemberRepository がロードされていません");
    }
}
