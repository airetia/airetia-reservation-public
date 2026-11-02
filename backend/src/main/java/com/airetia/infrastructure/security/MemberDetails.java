// backend/src/main/java/com/airetia/infrastructure/security/MemberDetails.java
package com.airetia.infrastructure.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.airetia.domain.model.member.Member;

import lombok.Getter;

/**
 * Spring Security 認証ユーザー詳細
 * → 04_backend_specification.md §4.2 MemberDetails
 *
 * 修正: isAccountNonLocked() を常に true に変更
 *
 * 変更理由:
 *   利用停止（is_locked = true）は「予約作成・変更の禁止」であり、
 *   ログイン自体は禁止していない（§4.3 制限なし: 既存予約閲覧・プロフィール編集等）。
 *   Spring Security の DaoAuthenticationProvider は isAccountNonLocked() = false のとき
 *   LockedException を投げてログインを拒否するため、ログインできなくなっていた。
 *
 *   停止中ユーザーへの機能制限は各 Service メソッドの冒頭で
 *   member.isSuspended() チェックにより行う（BookingService.createBooking 等）。
 *
 * → 02_business_rules.md §4.3 利用停止の範囲
 *   制限: 新規予約作成・既存予約変更
 *   制限なし: 既存予約閲覧・24時間前までのキャンセル・プロフィール編集・チケット購入
 */
@Getter
public class MemberDetails implements UserDetails {

    private final Member member;

    public MemberDetails(Member member) {
        this.member = member;
    }

    public Long getId() {
        return member.getId();
    }

    @Override
    public String getUsername() {
        return member.getEmail();
    }

    @Override
    public String getPassword() {
        return member.getPasswordHash();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + member.getRole().name()));
    }

    /**
     * 常に true を返す。
     * 利用停止チェックはログイン後の各 Service で member.isSuspended() により行う。
     * ここで false を返すと Spring Security がログイン自体を拒否してしまう。
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * 論理削除済みアカウント（is_active = false）はログイン不可。
     * ペナルティによる一時停止とは別概念。
     */
    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(member.getIsActive());
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}