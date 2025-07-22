package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Data;

import java.util.Map;

@Data
public class TasteProfileRequest {
   private Map<String, Object> artistPreferences;
   private Map<String, Object> moviePreferences;
   private Map<String, Object> bookPreferences;
   private Map<String, Object> activityPreferences;
}
