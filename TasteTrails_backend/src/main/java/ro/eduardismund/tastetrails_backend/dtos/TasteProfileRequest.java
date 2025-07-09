package ro.eduardismund.tastetrails_backend.dtos;

import lombok.Data;

import java.util.Map;

@Data
public class TasteProfileRequest {
   private Map<String, Object> musicPreferences;
   private Map<String, Object> moviePreferences;
   private Map<String, Object> foodPreferences;
   private Map<String, Object> activityPreferences;
}
