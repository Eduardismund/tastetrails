package ro.eduardismund.tastetrails_backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ro.eduardismund.tastetrails_backend.model.TasteProfile;
import ro.eduardismund.tastetrails_backend.model.User;
import ro.eduardismund.tastetrails_backend.repository.TasteProfileRepository;
import ro.eduardismund.tastetrails_backend.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TasteProfileService {
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;

    public TasteProfile createOrUpdateTasteProfile(UUID userId, Map<String, Object> musicPrefs, Map<String, Object> moviePrefs,
                                                   Map<String, Object> foodPrefs, Map<String, Object> activityPrefs){
        final var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        final var tasteProfile = tasteProfileRepository.findByUserId(user.getId());

        var profile = new TasteProfile();
        profile = tasteProfile.orElseGet(() -> TasteProfile.builder()
                .user(user)
                .build());

        profile.setActivityPreferences(activityPrefs);
        profile.setMusicPreferences(musicPrefs);
        profile.setMoviePreferences(moviePrefs);
        profile.setFoodPreferences(foodPrefs);

        return tasteProfileRepository.save(profile);

    }

    @Transactional(readOnly = true)  // ← Added readOnly for performance
    public Optional<TasteProfile> findByUserId(UUID userId) {
        return tasteProfileRepository.findByUserId(userId);
    }

    public void deleteTasteProfile(UUID userId) {
        tasteProfileRepository.deleteByUserId(userId);
    }
}
