# Pak Ali Robot Companion - Implementation Plan

## Overview

Transform the AI shopkeeper Pak Ali into a physical robot companion using open-source robots (Petoi Bittle/OpenCat) that reacts to in-game financial decisions in real-time.

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Game Client       │     │   Event Bridge      │     │   Robot Hardware    │
│   (Next.js/Unity)   │────▶│   (WebSocket/API)   │────▶│   (ESP32/Arduino)   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                           │
         │                           ▼                           │
         │                  ┌─────────────────────┐              │
         │                  │   Claude AI (TTS)   │              │
         │                  │   Manglish Dialogue │──────────────┘
         │                  └─────────────────────┘       (Audio playback)
         │
         ▼
┌─────────────────────┐
│   Convex Database   │
│   (robotEvents)     │
└─────────────────────┘
```

---

## Phase 1: Next.js Web Game (Current)

### 1.1 Database Schema Addition

Add `robotEvents` table to `convex/schema.ts`:

```typescript
robotEvents: defineTable({
  gameId: v.id("games"),
  eventType: v.string(), // "purchase" | "decision" | "stat_change" | "milestone" | "game_over"
  emotion: v.string(),   // "happy" | "sad" | "worried" | "proud" | "excited" | "disappointed"
  animationId: v.string(), // Robot animation to trigger
  dialogue: v.optional(v.string()), // Manglish dialogue for TTS
  data: v.optional(v.any()),
  isProcessed: v.boolean(),
  createdAt: v.number(),
})
  .index("by_game", ["gameId"])
  .index("by_unprocessed", ["gameId", "isProcessed"]),
```

### 1.2 Robot Events Convex Functions

Create `convex/robotEvents.ts`:

```typescript
// Mutations
emitRobotEvent(gameId, eventType, emotion, animationId, dialogue?, data?)
markEventProcessed(eventId)
clearProcessedEvents(gameId)

// Queries
getUnprocessedEvents(gameId) // For robot polling
subscribeToEvents(gameId)    // Real-time subscription
```

### 1.3 Event Emission Points

Integrate into existing game logic at these decision points:

| Game Event | Robot Emotion | Animation | Example Dialogue |
|------------|---------------|-----------|------------------|
| Buy Maggi instead of vegetables | sad | head_shake | "Aiyah, beli sayur la dik..." |
| Save money | happy | wag_tail | "Bagus! Simpan duit elok-elok!" |
| Pay debt on time | proud | celebrate | "Wah, responsible betul!" |
| Credit score drops | worried | crouch | "Alamak, credit score turun..." |
| Go to Along (loan shark) | scared | shake | "Jangan dik! Along bahaya!" |
| Buy groceries | happy | nod | "Pandai! Makan sihat penting" |
| Skip work | disappointed | turn_away | "Eh, kerja macam mana ni?" |
| Complete week objectives | excited | jump | "Syabas! Semua siap!" |
| Game over (good ending) | proud | dance | "Tahniah! Pak Ali bangga!" |
| Game over (bad ending) | sad | lay_down | "Takpe, cuba lagi..." |

### 1.4 REST API Endpoints

Create `app/api/robot/` endpoints:

```
GET  /api/robot/events?gameId=xxx     # Poll for unprocessed events
POST /api/robot/events/ack            # Mark events as processed
GET  /api/robot/events/stream?gameId=xxx  # SSE for real-time events
POST /api/robot/tts                   # Generate TTS audio from dialogue
```

### 1.5 Robot Connection Dashboard

Create `app/robot/page.tsx`:

- QR code for robot WiFi setup
- Game session pairing
- Event log viewer
- Manual animation triggers (for testing)
- TTS preview

---

## Phase 2: Unity Port

### 2.1 Shared Backend (Keep Same API)

The robot API remains **unchanged** - Unity just uses the same endpoints:

```csharp
// Unity C# - RobotEventService.cs
public class RobotEventService : MonoBehaviour
{
    private const string API_BASE = "https://your-domain.com/api/robot";

    public async Task EmitEvent(RobotEvent evt)
    {
        var json = JsonUtility.ToJson(evt);
        await PostAsync($"{API_BASE}/events", json);
    }
}
```

### 2.2 Unity Event Emitter Integration

```csharp
// GameManager.cs
public class GameManager : MonoBehaviour
{
    [SerializeField] private RobotEventService robotService;

    public async void OnPlayerDecision(Decision decision)
    {
        // Existing game logic...

        // Emit robot event
        var emotion = DetermineEmotion(decision);
        await robotService.EmitEvent(new RobotEvent
        {
            EventType = "decision",
            Emotion = emotion,
            AnimationId = GetAnimation(emotion),
            Dialogue = GenerateDialogue(decision)
        });
    }
}
```

### 2.3 Unity-Specific Additions

- **Local Bluetooth Option**: For latency-sensitive reactions, Unity can communicate directly with the robot via Bluetooth
- **AR Overlay**: Use AR Foundation to show virtual Pak Ali when physical robot isn't available
- **Sound Effects**: Local sound playback synced with robot animations

---

## Phase 3: Robot Hardware

### 3.1 Recommended Hardware

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Petoi Bittle** | ~RM600 | Pre-built, good animations, ESP32 | Limited expressions |
| **OpenCat (DIY)** | ~RM300 | Customizable, cheaper | Requires assembly |
| **Custom ESP32 Bot** | ~RM150 | Full control, cheapest | Most work |

### 3.2 Robot Firmware (Arduino/ESP32)

```cpp
// pak_ali_robot.ino
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* API_ENDPOINT = "https://your-domain.com/api/robot/events";
String gameId = "";

void setup() {
  connectWiFi();
  // Initialize servos, speaker
}

void loop() {
  if (gameId != "") {
    pollEvents();
  }
  delay(500); // Poll every 500ms
}

void pollEvents() {
  HTTPClient http;
  http.begin(API_ENDPOINT + "?gameId=" + gameId);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    processEvents(payload);
  }
}

void processEvents(String json) {
  DynamicJsonDocument doc(2048);
  deserializeJson(doc, json);

  for (JsonObject event : doc["events"].as<JsonArray>()) {
    String animation = event["animationId"];
    String dialogue = event["dialogue"];

    playAnimation(animation);
    playTTS(dialogue);

    // Acknowledge event
    ackEvent(event["id"]);
  }
}

void playAnimation(String animId) {
  if (animId == "happy") { wagTail(); }
  else if (animId == "sad") { headDown(); }
  else if (animId == "celebrate") { jumpDance(); }
  // ... more animations
}
```

### 3.3 Animation Library

Define robot animations mapped to emotions:

```cpp
// animations.h
void wagTail();      // Happy
void headShake();    // Disappointed
void crouch();       // Worried
void jumpDance();    // Excited/Celebrate
void layDown();      // Sad
void turnAway();     // Disappointed
void nod();          // Approval
void shake();        // Scared/Warning
```

### 3.4 TTS Integration

Options for Manglish text-to-speech:

1. **Cloud TTS (Recommended)**:
   - Google Cloud TTS (Malay voice)
   - Generate audio on server, stream to robot

2. **Local TTS**:
   - DFPlayer Mini + pre-recorded audio files
   - Map common phrases to MP3 files on SD card

---

## Phase 4: Enhanced Features

### 4.1 Two-Way Interaction

Robot can send input back to game:

```typescript
// Robot buttons/sensors trigger game events
interface RobotInput {
  type: "poke" | "pat" | "shake";
  intensity: number;
}

// In game: Pak Ali gives bonus tips when petted
```

### 4.2 Emotional Memory

Robot remembers player's patterns:

```typescript
// Track player behavior over time
interface PlayerBehavior {
  savingTendency: number;     // -1 to 1
  healthChoices: number;      // -1 to 1
  debtManagement: number;     // -1 to 1
}

// Pak Ali's reactions become personalized
```

### 4.3 Multi-Robot Support

Classroom/workshop setting with multiple robots:

```typescript
// Teacher dashboard
- View all connected robots
- Broadcast messages to all
- Leaderboard display on robots
- Group challenges
```

---

## Implementation Priority

### MVP (Hackathon Demo)
1. ✅ Robot events schema
2. ✅ Basic event emission (purchase decisions only)
3. ✅ REST API for polling
4. ✅ Petoi Bittle with 3-4 animations
5. ✅ Pre-recorded audio files (no live TTS)

### Post-Hackathon
1. Full event integration
2. Real-time WebSocket/SSE
3. Cloud TTS for dynamic dialogue
4. Robot connection dashboard
5. Unity integration

### Future
1. Two-way interaction
2. Emotional memory
3. Multi-robot classroom mode
4. AR fallback in Unity

---

## File Structure (After Implementation)

```
convex/
├── robotEvents.ts          # Robot event mutations/queries

app/
├── api/robot/
│   ├── events/route.ts     # GET events, POST acknowledge
│   ├── stream/route.ts     # SSE endpoint
│   └── tts/route.ts        # TTS generation
├── robot/
│   └── page.tsx            # Robot connection dashboard

lib/
├── robot-emotions.ts       # Emotion mapping logic
├── robot-dialogues.ts      # Pak Ali dialogue templates

hardware/
├── pak_ali_robot/
│   ├── pak_ali_robot.ino   # Main Arduino sketch
│   ├── animations.h        # Animation definitions
│   ├── wifi_config.h       # WiFi credentials
│   └── README.md           # Hardware setup guide
```

---

## Quick Start Commands

```bash
# 1. After implementing, test the API
curl http://localhost:3000/api/robot/events?gameId=YOUR_GAME_ID

# 2. Test SSE stream
curl -N http://localhost:3000/api/robot/events/stream?gameId=YOUR_GAME_ID

# 3. Upload firmware to robot (Arduino IDE)
# Open hardware/pak_ali_robot/pak_ali_robot.ino
# Set WiFi credentials in wifi_config.h
# Upload to ESP32
```

---

## Cost Estimate

| Item | Cost (RM) |
|------|-----------|
| Petoi Bittle Robot | 600 |
| DFPlayer Mini + Speaker | 30 |
| SD Card (for audio) | 20 |
| Power Bank | 50 |
| **Total** | **~700** |

Or DIY option:

| Item | Cost (RM) |
|------|-----------|
| ESP32 DevKit | 35 |
| 4x SG90 Servo | 40 |
| DFPlayer Mini + Speaker | 30 |
| 3D Printed Body | 50 |
| Battery + Holder | 30 |
| **Total** | **~185** |

---

## Resources

- **Petoi Bittle**: https://www.petoi.com/pages/bittle-open-source-bionic-robot-dog
- **OpenCat**: https://github.com/PetoiCamp/OpenCat
- **ESP32 Arduino**: https://docs.espressif.com/projects/arduino-esp32/
- **Google Cloud TTS**: https://cloud.google.com/text-to-speech
- **Convex Real-time**: https://docs.convex.dev/client/react#real-time-updates
