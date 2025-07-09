package ro.eduardismund.tastetrails_backend.repository;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ro.eduardismund.tastetrails_backend.model.Itinerary;
import ro.eduardismund.tastetrails_backend.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, UUID> {
    List<Itinerary> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Itinerary> findByDestinationContainingIgnoreCase(String destination);
    @Query("SELECT i FROM Itinerary i WHERE i.user.id = :userId AND i.startDate >= :currentDate ORDER BY i.startDate ASC")
    List<Itinerary> findUpcomingItinerariesByUserId(@Param("userId") UUID userId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT i FROM Itinerary i WHERE i.user.id = :userId AND i.endDate < :currentDate ORDER BY i.startDate DESC")
    List<Itinerary> findPastItinerariesByUserId(@Param("userId") UUID userId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT i FROM Itinerary i WHERE i.user.id = :userId AND :currentDate BETWEEN i.startDate  AND i.endDate")
    List<Itinerary> findCurrentItinerariesByUserId(@Param("userId") UUID userId, @Param("currentDate") LocalDate currentDate);

    long countByUserId(UUID userId);

    List<Itinerary> findByStartDateBetween(LocalDate startDate, LocalDate endDate);

}
