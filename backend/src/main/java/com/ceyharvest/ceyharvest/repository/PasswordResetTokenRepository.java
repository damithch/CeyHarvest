package com.ceyharvest.ceyharvest.repository;

import com.ceyharvest.ceyharvest.document.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    List<PasswordResetToken> findByEmailAndUsedFalse(String email);
    void deleteByExpiryDateBefore(LocalDateTime date);
    void deleteByEmail(String email);
}
