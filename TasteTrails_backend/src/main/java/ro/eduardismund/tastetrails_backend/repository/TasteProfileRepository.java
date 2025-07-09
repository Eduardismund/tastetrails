package ro.eduardismund.tastetrails_backend.repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ro.eduardismund.tastetrails_backend.model.TasteProfile;
import ro.eduardismund.tastetrails_backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TasteProfileRepository extends JpaRepository<TasteProfile, UUID> {
    Optional<TasteProfile> findByUserId(UUID id);
    boolean existsByUserId(UUID userId);
    void deleteByUserId(UUID userId);

    @Query("SELECT tp from TasteProfile tp JOIN tp.user u WHERE u.email = :email")
    Optional<TasteProfile> findByUserEmail(@Param("email") String email);
}
