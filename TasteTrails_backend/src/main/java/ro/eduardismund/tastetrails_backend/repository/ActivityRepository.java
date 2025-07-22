package ro.eduardismund.tastetrails_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ro.eduardismund.tastetrails_backend.model.Activity;
import ro.eduardismund.tastetrails_backend.model.Itinerary;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByItineraryIdOrderByActivityDateAsc(UUID itineraryId);
    List<Activity> findByItineraryId(UUID itineraryId);
}
