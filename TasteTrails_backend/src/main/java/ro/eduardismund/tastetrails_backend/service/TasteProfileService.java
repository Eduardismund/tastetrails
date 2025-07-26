package ro.eduardismund.tastetrails_backend.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ro.eduardismund.tastetrails_backend.model.TasteProfile;
import ro.eduardismund.tastetrails_backend.repository.TasteProfileRepository;
import ro.eduardismund.tastetrails_backend.repository.UserRepository;

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

    public TasteProfile createOrUpdateTasteProfile(UUID userId,
                                                   Map<String, Object> artistPrefs,
                                                   Map<String, Object> moviePrefs,
                                                   Map<String, Object> bookPrefs,
                                                   Map<String, Object> brandPrefs,
                                                   Map<String, Object> videoGamePrefs,
                                                   Map<String, Object> tvShowPrefs,
                                                   Map<String, Object> podcastPrefs,
                                                   Map<String, Object> personPrefs
    ){
        final var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        final var tasteProfile = tasteProfileRepository.findByUserId(user.getId());

        var profile = new TasteProfile();
        profile = tasteProfile.orElseGet(() -> TasteProfile.builder()
                .user(user)
                .build());

        profile.setArtistPreferences(artistPrefs);
        profile.setMoviePreferences(moviePrefs);
        profile.setBookPreferences(bookPrefs);
        profile.setBrandPreferences(brandPrefs);
        profile.setVideoGamePreferences(videoGamePrefs);
        profile.setTvShowPreferences(tvShowPrefs);
        profile.setPodcastPreferences(podcastPrefs);
        profile.setPersonPreferences(personPrefs);

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
