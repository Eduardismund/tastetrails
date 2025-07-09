package ro.eduardismund.tastetrails_backend.repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ro.eduardismund.tastetrails_backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByCreatedAtAfter(LocalDateTime date);
    @Query("SELECT u FROM User u WHERE u.tasteProfile IS NOT NULL")
    List<User> findUserWithTasteProfile();

    @Query("SELECT u from User u LEFT JOIN FETCH u.tasteProfile WHERE u.email = :email")
    Optional<User> findByEmailWithTasteProfile(@Param("email") String email);
}
