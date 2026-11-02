// backend/src/main/java/com/airetia/application/service/inquiry/InquiryService.java
package com.airetia.application.service.inquiry;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.inquiry.InquiryRequest;
import com.airetia.application.dto.request.inquiry.InquiryStatusUpdateRequest;
import com.airetia.application.dto.response.inquiry.InquiryResponse;
import com.airetia.domain.model.inquiry.Inquiry;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.exception.BusinessException;
import com.airetia.repository.InquiryRepository;
import com.airetia.infrastructure.storage.S3StorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 問い合わせサービス
 * → 03_common_specification.md §5 問い合わせ
 * → 02_business_rules.md §8（本文1000文字以内・添付最大3件）
 *
 * 添付ファイルのアップロードは S3StorageService 経由で行う。
 * 添付数上限（3件）はコントローラー層でチェックする。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository    inquiryRepository;
    private final S3StorageService      s3StorageService;

    /**
     * 問い合わせ作成（未ログインユーザーも可）
     * POST /api/v1/inquiries
     */
    @Transactional
    public InquiryResponse create(
            InquiryRequest req,
            java.util.List<org.springframework.web.multipart.MultipartFile> files) {

        Inquiry inquiry = Inquiry.builder()
            .email(req.getEmail())
            .name(req.getName())
            .subject(req.getSubject())
            .body(req.getBody())
            .build();
        inquiry = inquiryRepository.save(inquiry);

        // 添付ファイル保存（最大3件・10MB・JPG/PNG/PDF）
        // S3StorageService 経由でアップロード（keyPrefix: "inquiries/{id}"）
        if (files != null && !files.isEmpty()) {
            for (var file : files) {
                if (file.isEmpty()) continue;
                validateAttachment(file);
                String key = saveAttachment(file, inquiry.getId());
                com.airetia.domain.model.inquiry.InquiryAttachment attachment =
                    com.airetia.domain.model.inquiry.InquiryAttachment.builder()
                        .inquiry(inquiry)
                        .s3Key(key)
                        .originalFilename(file.getOriginalFilename())
                        .contentType(file.getContentType())
                        .build();
                inquiry.getAttachments().add(attachment);
            }
            inquiry = inquiryRepository.save(inquiry);
        }

        log.info("Inquiry created: id={}, email={}", inquiry.getId(), inquiry.getEmail());
        return InquiryResponse.from(inquiry);
    }

    /** 添付ファイルバリデーション */
    private void validateAttachment(org.springframework.web.multipart.MultipartFile file) {
        if (file.getSize() > 10 * 1024 * 1024L) {
            throw new com.airetia.exception.BusinessException("添付ファイルは10MB以内にしてください");
        }
        java.util.Set<String> allowed = java.util.Set.of("image/jpeg","image/png","application/pdf");
        if (!allowed.contains(file.getContentType())) {
            throw new com.airetia.exception.BusinessException("JPG / PNG / PDF のみ添付できます");
        }
    }

    /** Phase1: ローカル保存 */
    private String saveAttachment(org.springframework.web.multipart.MultipartFile file, Long inquiryId) {
        return s3StorageService.uploadWithKey(file, "inquiries/" + inquiryId);
    }

    /**
     * 問い合わせ一覧取得（管理者）
     * GET /api/v1/inquiries
     */
    @Transactional(readOnly = true)
    public Page<InquiryResponse> getAll(Pageable pageable) {
        return inquiryRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map(InquiryResponse::from);
    }

    /**
     * 問い合わせ詳細取得（管理者）
     * GET /api/v1/inquiries/{id}
     */
    @Transactional(readOnly = true)
    public InquiryResponse getById(Long id) {
        return InquiryResponse.from(
            inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("問い合わせが見つかりません: id=" + id))
        );
    }

    /**
     * ステータス更新（管理者）
     * PATCH /api/v1/inquiries/{id}/status
     */
    @Transactional
    public InquiryResponse updateStatus(Long id, InquiryStatusUpdateRequest req) {
        Inquiry inquiry = inquiryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("問い合わせが見つかりません: id=" + id));
        inquiry.updateStatus(req.getStatus());
        return InquiryResponse.from(inquiryRepository.save(inquiry));
    }
}
