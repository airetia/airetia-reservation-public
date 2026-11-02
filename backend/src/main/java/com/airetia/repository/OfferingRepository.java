// backend/src/main/java/com/airetia/repository/OfferingRepository.java
package com.airetia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.offering.DeliveryMethod;
import com.airetia.domain.model.offering.Offering;

/**
 * オファリングリポジトリ
 * → 02_business_rules.md §2（予約ルール / Offering 属性）
 * → 06_infrastructure.md §2.2（offerings テーブル）
 *
 * 修正:
 *   Offering.java のフィールド名を isActive → active に変更したため
 *   Spring Data 派生クエリのプロパティ名を IsActive → Active に統一する。
 *   例: findByIsActiveTrue() → findByActiveTrue()
 */
@Repository
public interface OfferingRepository extends JpaRepository<Offering, Long> {

    /** 有効サービス一覧（公開用） */
    List<Offering> findByActiveTrue();

    /** プロバイダーの全サービス一覧（管理用・新しい順） */
    List<Offering> findByProvider_IdOrderByCreatedAtDesc(Long providerId);

    /** プロバイダーの有効サービス一覧 */
    List<Offering> findByProvider_IdAndActiveTrue(Long providerId);

    /** 提供形態でフィルタした有効サービス一覧（公開用） */
    List<Offering> findByDeliveryMethodAndActiveTrue(DeliveryMethod deliveryMethod);

    /**
     * サービスに紐づく有効予約数（CONFIRMED / PENDING）
     * OfferingService.delete() で利用
     */
    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.availability.offering.id = :offeringId
          AND b.status IN (
            com.airetia.domain.model.booking.BookingStatus.CONFIRMED,
            com.airetia.domain.model.booking.BookingStatus.PENDING
          )
        """)
    long countActiveBookingsByOfferingId(@org.springframework.data.repository.query.Param("offeringId") Long offeringId);
}