package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Data;

import java.util.Map;

@Data
public class TasteProfileRequest {
   private Map<String, Object> artistPreferences;
   private Map<String, Object> moviePreferences;
   private Map<String, Object> bookPreferences;
   private Map<String, Object> brandPreferences;
   private Map<String, Object> videoGamePreferences;
   private Map<String, Object> tvShowPreferences;
   private Map<String, Object> podcastPreferences;
   private Map<String, Object> personPreferences;

}
