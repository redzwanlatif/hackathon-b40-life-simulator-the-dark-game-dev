# Pak Ali Robot Companion - Technical Flow

## Table of Contents
1. [Next.js Web Game Flow](#1-nextjs-web-game-flow)
2. [Unity Game Flow](#2-unity-game-flow)
3. [Shared Backend Architecture](#3-shared-backend-architecture)
4. [Robot Hardware Flow](#4-robot-hardware-flow)
5. [Sequence Diagrams](#5-sequence-diagrams)

---

## 1. Next.js Web Game Flow

### 1.1 System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS WEB APPLICATION                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │   Browser    │    │  React App   │    │   Convex     │                 │
│  │   Client     │◄──►│  Components  │◄──►│   Client     │                 │
│  └──────────────┘    └──────────────┘    └──────────────┘                 │
│                              │                   │                         │
│                              ▼                   ▼                         │
│                      ┌──────────────┐    ┌──────────────┐                 │
│                      │  Game State  │    │   Convex     │                 │
│                      │   Context    │    │   Backend    │                 │
│                      └──────────────┘    └──────────────┘                 │
│                                                 │                         │
└─────────────────────────────────────────────────┼─────────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────┐
                    │                             ▼                         │
                    │                    ┌──────────────┐                   │
                    │                    │   Convex     │                   │
                    │                    │   Database   │                   │
                    │                    └──────────────┘                   │
                    │                             │                         │
                    │         ┌───────────────────┼───────────────────┐     │
                    │         ▼                   ▼                   ▼     │
                    │  ┌────────────┐     ┌────────────┐     ┌────────────┐ │
                    │  │   games    │     │ decisions  │     │robotEvents │ │
                    │  └────────────┘     └────────────┘     └────────────┘ │
                    │                                               │       │
                    │                       CONVEX CLOUD            │       │
                    └───────────────────────────────────────────────┼───────┘
                                                                    │
                    ┌───────────────────────────────────────────────┼───────┐
                    │                    NEXT.JS API ROUTES         │       │
                    │                                               ▼       │
                    │  ┌──────────────────────────────────────────────────┐ │
                    │  │              /api/robot/events                   │ │
                    │  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐   │ │
                    │  │  │  GET    │  │  POST   │  │  SSE Stream     │   │ │
                    │  │  │ (poll)  │  │  (ack)  │  │  (real-time)    │   │ │
                    │  │  └─────────┘  └─────────┘  └─────────────────┘   │ │
                    │  └──────────────────────────────────────────────────┘ │
                    │                          │                            │
                    └──────────────────────────┼────────────────────────────┘
                                               │
                                               ▼
                    ┌──────────────────────────────────────────────────────┐
                    │                   ROBOT HARDWARE                     │
                    │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
                    │  │   ESP32    │  │   Servos   │  │  Speaker/TTS   │  │
                    │  │   WiFi     │  │  Motors    │  │  DFPlayer      │  │
                    │  └────────────┘  └────────────┘  └────────────────┘  │
                    └──────────────────────────────────────────────────────┘
```

### 1.2 Data Flow - Player Makes Decision

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Player  │     │  React  │     │ Convex  │     │  API    │     │  Robot  │
│ Action  │     │   UI    │     │ Backend │     │ Route   │     │Hardware │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Click Choice  │               │               │               │
     ├──────────────►│               │               │               │
     │               │               │               │               │
     │               │ makeDecision()│               │               │
     │               ├──────────────►│               │               │
     │               │               │               │               │
     │               │               │ 1. Update game state          │
     │               │               │ 2. Record decision            │
     │               │               │ 3. Emit robot event           │
     │               │               ├───────┐       │               │
     │               │               │       │       │               │
     │               │               │◄──────┘       │               │
     │               │               │               │               │
     │               │ Updated State │               │               │
     │               │◄──────────────┤               │               │
     │               │               │               │               │
     │  UI Update    │               │               │ Poll events   │
     │◄──────────────┤               │               │◄──────────────┤
     │               │               │               │               │
     │               │               │               │ Robot events  │
     │               │               │               ├──────────────►│
     │               │               │               │               │
     │               │               │               │               │ Play
     │               │               │               │               │ Animation
     │               │               │               │               │ + TTS
     │               │               │               │               │
```

### 1.3 File Structure

```
hackathon-b40-life-simulator/
├── convex/
│   ├── schema.ts              # Add robotEvents table
│   ├── games.ts               # Existing game mutations
│   ├── robotEvents.ts         # NEW: Robot event mutations/queries
│   │   ├── emitEvent()        # Create new robot event
│   │   ├── getUnprocessed()   # Get pending events for robot
│   │   ├── markProcessed()    # Acknowledge event received
│   │   └── subscribe()        # Real-time subscription
│   └── _generated/
│
├── app/
│   ├── game/
│   │   └── page.tsx           # Modify: Add robot event emissions
│   │
│   ├── api/
│   │   └── robot/
│   │       ├── events/
│   │       │   └── route.ts   # GET: poll, POST: acknowledge
│   │       ├── stream/
│   │       │   └── route.ts   # SSE endpoint for real-time
│   │       └── tts/
│   │           └── route.ts   # Generate TTS audio
│   │
│   └── robot/
│       └── page.tsx           # Robot pairing dashboard
│
├── lib/
│   ├── robot-emotions.ts      # Emotion detection logic
│   └── robot-dialogues.ts     # Pak Ali dialogue templates
│
└── components/
    └── robot/
        ├── RobotStatus.tsx    # Connection status indicator
        └── EventLog.tsx       # Debug event viewer
```

### 1.4 Key Code Snippets

#### convex/robotEvents.ts
```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Emit a robot event
export const emitEvent = mutation({
  args: {
    gameId: v.id("games"),
    eventType: v.string(),
    emotion: v.string(),
    animationId: v.string(),
    dialogue: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("robotEvents", {
      ...args,
      isProcessed: false,
      createdAt: Date.now(),
    });
  },
});

// Get unprocessed events for robot polling
export const getUnprocessed = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("robotEvents")
      .withIndex("by_unprocessed", (q) =>
        q.eq("gameId", args.gameId).eq("isProcessed", false)
      )
      .collect();
  },
});

// Mark event as processed
export const markProcessed = mutation({
  args: { eventId: v.id("robotEvents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { isProcessed: true });
  },
});
```

#### app/api/robot/events/route.ts
```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// GET - Poll for unprocessed events
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  if (!gameId) {
    return Response.json({ error: "gameId required" }, { status: 400 });
  }

  const events = await convex.query(api.robotEvents.getUnprocessed, {
    gameId: gameId as any,
  });

  return Response.json({ events });
}

// POST - Acknowledge events
export async function POST(request: Request) {
  const { eventIds } = await request.json();

  for (const eventId of eventIds) {
    await convex.mutation(api.robotEvents.markProcessed, { eventId });
  }

  return Response.json({ success: true });
}
```

#### app/api/robot/stream/route.ts (SSE)
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Poll Convex every 500ms and push new events
      const interval = setInterval(async () => {
        const events = await convex.query(api.robotEvents.getUnprocessed, {
          gameId: gameId as any,
        });

        if (events.length > 0) {
          const data = `data: ${JSON.stringify(events)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      }, 500);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

#### Integration in Game Logic
```typescript
// In game decision handler
async function handlePlayerChoice(choice: Choice) {
  // 1. Existing game logic
  await makeDecision({ gameId, choiceIndex, ... });

  // 2. NEW: Emit robot event
  const emotion = determineEmotion(choice);
  await emitRobotEvent({
    gameId,
    eventType: "decision",
    emotion: emotion,
    animationId: EMOTION_TO_ANIMATION[emotion],
    dialogue: generatePakAliDialogue(choice, emotion),
  });
}

// Emotion determination logic
function determineEmotion(choice: Choice): RobotEmotion {
  if (choice.moneyChange < -100) return "worried";
  if (choice.moneyChange > 50) return "happy";
  if (choice.healthChange < -10) return "sad";
  if (choice.creditChange > 0) return "proud";
  return "neutral";
}
```

---

## 2. Unity Game Flow

### 2.1 System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           UNITY GAME APPLICATION                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │    Unity     │    │    Game      │    │   Network    │                 │
│  │   Renderer   │◄──►│   Manager    │◄──►│   Manager    │                 │
│  └──────────────┘    └──────────────┘    └──────────────┘                 │
│                              │                   │                         │
│                              ▼                   ▼                         │
│                      ┌──────────────┐    ┌──────────────┐                 │
│                      │    Robot     │    │    REST      │                 │
│                      │   Service    │    │   Client     │                 │
│                      └──────────────┘    └──────────────┘                 │
│                              │                   │                         │
│           ┌──────────────────┴───────────────────┘                        │
│           │                                                                │
│           ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                        COMMUNICATION OPTIONS                         │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │ │
│  │  │  REST API   │    │  WebSocket  │    │  Bluetooth (Optional)   │   │ │
│  │  │  (HTTP)     │    │  (Real-time)│    │  (Low latency local)    │   │ │
│  │  └─────────────┘    └─────────────┘    └─────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   SAME BACKEND   │      │   SAME BACKEND   │      │  DIRECT TO ROBOT │
│   (Next.js API)  │      │   (Convex)       │      │  (Bluetooth/BLE) │
│                  │      │                  │      │                  │
│  /api/robot/*    │      │  Convex Client   │      │  ESP32 BLE GATT  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 2.2 Data Flow - Unity to Robot

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Player  │     │  Unity  │     │  Robot  │     │ Backend │     │  Robot  │
│ Input   │     │  Game   │     │ Service │     │  API    │     │Hardware │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │               │
     │ Touch/Click   │               │               │               │
     ├──────────────►│               │               │               │
     │               │               │               │               │
     │               │ ProcessChoice │               │               │
     │               ├───────┐       │               │               │
     │               │       │       │               │               │
     │               │◄──────┘       │               │               │
     │               │               │               │               │
     │               │ EmitRobotEvent│               │               │
     │               ├──────────────►│               │               │
     │               │               │               │               │
     │               │               │ POST /api/robot/events        │
     │               │               ├──────────────►│               │
     │               │               │               │               │
     │               │               │               │ Store event   │
     │               │               │               ├───────┐       │
     │               │               │               │       │       │
     │               │               │               │◄──────┘       │
     │               │               │               │               │
     │               │               │  { success }  │               │
     │               │               │◄──────────────┤               │
     │               │               │               │               │
     │               │               │               │ GET events    │
     │               │               │               │◄──────────────┤
     │               │               │               │               │
     │               │               │               │ events[]      │
     │               │               │               ├──────────────►│
     │               │               │               │               │
     │               │               │               │               │ Execute
     │               │               │               │               │
     │  Game Update  │               │               │               │
     │◄──────────────┤               │               │               │
     │               │               │               │               │
```

### 2.3 Unity Project Structure

```
Assets/
├── Scripts/
│   ├── Core/
│   │   ├── GameManager.cs           # Main game controller
│   │   ├── PlayerController.cs      # Player movement/input
│   │   └── DecisionManager.cs       # Handle player choices
│   │
│   ├── Robot/
│   │   ├── RobotEventService.cs     # HTTP client for robot API
│   │   ├── RobotEmotionMapper.cs    # Map decisions to emotions
│   │   ├── RobotDialogueGenerator.cs # Generate Pak Ali dialogue
│   │   ├── BluetoothRobotService.cs # Optional: Direct BLE connection
│   │   └── RobotEventQueue.cs       # Queue events if offline
│   │
│   ├── Network/
│   │   ├── APIClient.cs             # Base REST client
│   │   ├── ConvexClient.cs          # Optional: Direct Convex SDK
│   │   └── WebSocketClient.cs       # Real-time connection
│   │
│   ├── Data/
│   │   ├── RobotEvent.cs            # Event data model
│   │   ├── RobotEmotion.cs          # Emotion enum
│   │   └── RobotAnimation.cs        # Animation mappings
│   │
│   └── UI/
│       ├── RobotStatusUI.cs         # Connection indicator
│       └── RobotDebugPanel.cs       # Debug event viewer
│
├── Prefabs/
│   └── Robot/
│       └── VirtualPakAli.prefab     # AR/fallback virtual robot
│
├── ScriptableObjects/
│   └── RobotConfig.asset            # API URLs, animation mappings
│
└── Plugins/
    └── BLE/                         # Bluetooth plugin (optional)
```

### 2.4 Key Unity Scripts

#### RobotEventService.cs
```csharp
using System;
using System.Collections;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

[Serializable]
public class RobotEvent
{
    public string gameId;
    public string eventType;
    public string emotion;
    public string animationId;
    public string dialogue;
    public object data;
}

public class RobotEventService : MonoBehaviour
{
    [SerializeField] private string apiBaseUrl = "https://your-domain.com/api/robot";
    [SerializeField] private bool useLocalBluetooth = false;

    private BluetoothRobotService bluetoothService;
    private Queue<RobotEvent> offlineQueue = new Queue<RobotEvent>();

    private void Awake()
    {
        bluetoothService = GetComponent<BluetoothRobotService>();
    }

    public async Task EmitEvent(RobotEvent evt)
    {
        if (useLocalBluetooth && bluetoothService.IsConnected)
        {
            // Direct Bluetooth for low latency
            await bluetoothService.SendEvent(evt);
        }
        else
        {
            // REST API
            await SendEventToAPI(evt);
        }
    }

    private async Task SendEventToAPI(RobotEvent evt)
    {
        string json = JsonUtility.ToJson(evt);

        using (UnityWebRequest request = new UnityWebRequest($"{apiBaseUrl}/events", "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            var operation = request.SendWebRequest();

            while (!operation.isDone)
                await Task.Yield();

            if (request.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"Robot API Error: {request.error}");
                // Queue for retry
                offlineQueue.Enqueue(evt);
            }
        }
    }

    // Retry queued events
    private IEnumerator ProcessOfflineQueue()
    {
        while (true)
        {
            yield return new WaitForSeconds(5f);

            while (offlineQueue.Count > 0)
            {
                var evt = offlineQueue.Peek();
                try
                {
                    SendEventToAPI(evt).Wait();
                    offlineQueue.Dequeue();
                }
                catch
                {
                    break; // Still offline
                }
            }
        }
    }
}
```

#### RobotEmotionMapper.cs
```csharp
using UnityEngine;

public enum RobotEmotion
{
    Neutral,
    Happy,
    Sad,
    Worried,
    Proud,
    Excited,
    Disappointed,
    Scared
}

public static class RobotEmotionMapper
{
    public static RobotEmotion DetermineEmotion(
        float moneyChange,
        float healthChange,
        float creditChange,
        float stressChange,
        string decisionContext)
    {
        // Bad financial decision
        if (moneyChange < -100)
        {
            if (decisionContext.Contains("along") || decisionContext.Contains("loan_shark"))
                return RobotEmotion.Scared;
            return RobotEmotion.Worried;
        }

        // Good savings
        if (moneyChange > 50)
            return RobotEmotion.Happy;

        // Health impact
        if (healthChange < -10)
            return RobotEmotion.Sad;

        if (healthChange > 10)
            return RobotEmotion.Happy;

        // Credit score
        if (creditChange > 0)
            return RobotEmotion.Proud;

        if (creditChange < -20)
            return RobotEmotion.Disappointed;

        // Stress
        if (stressChange > 20)
            return RobotEmotion.Worried;

        return RobotEmotion.Neutral;
    }

    public static string GetAnimationId(RobotEmotion emotion)
    {
        return emotion switch
        {
            RobotEmotion.Happy => "wag_tail",
            RobotEmotion.Sad => "head_down",
            RobotEmotion.Worried => "crouch",
            RobotEmotion.Proud => "celebrate",
            RobotEmotion.Excited => "jump",
            RobotEmotion.Disappointed => "turn_away",
            RobotEmotion.Scared => "shake",
            _ => "idle"
        };
    }
}
```

#### DecisionManager.cs (Integration)
```csharp
using UnityEngine;
using System.Threading.Tasks;

public class DecisionManager : MonoBehaviour
{
    [SerializeField] private RobotEventService robotService;
    [SerializeField] private RobotDialogueGenerator dialogueGenerator;

    private string currentGameId;

    public async Task ProcessPlayerChoice(Choice choice)
    {
        // 1. Apply game state changes
        GameManager.Instance.ApplyChoice(choice);

        // 2. Determine robot reaction
        var emotion = RobotEmotionMapper.DetermineEmotion(
            choice.moneyChange,
            choice.healthChange,
            choice.creditChange,
            choice.stressChange,
            choice.context
        );

        // 3. Generate Pak Ali dialogue
        string dialogue = dialogueGenerator.Generate(choice, emotion);

        // 4. Emit robot event
        await robotService.EmitEvent(new RobotEvent
        {
            gameId = currentGameId,
            eventType = "decision",
            emotion = emotion.ToString().ToLower(),
            animationId = RobotEmotionMapper.GetAnimationId(emotion),
            dialogue = dialogue,
            data = new { choice.id, choice.location }
        });

        // 5. Update UI
        UIManager.Instance.ShowResult(choice);
    }
}
```

#### RobotDialogueGenerator.cs
```csharp
using System.Collections.Generic;
using UnityEngine;

public class RobotDialogueGenerator : MonoBehaviour
{
    private Dictionary<string, string[]> dialogueTemplates = new Dictionary<string, string[]>
    {
        { "happy_save", new[] {
            "Bagus! Simpan duit elok-elok!",
            "Wah, pandai betul anak ni!",
            "Good good, saving is important!"
        }},
        { "sad_maggi", new[] {
            "Aiyah, beli sayur la dik...",
            "Maggi lagi? Health important tau!",
            "Takpe la, next time beli sihat sikit"
        }},
        { "worried_debt", new[] {
            "Alamak, hutang ni kena bayar tau",
            "Credit score turun macam ni susah nak loan",
            "Be careful with money ah dik"
        }},
        { "scared_along", new[] {
            "Jangan dik! Along bahaya!",
            "Aiyoyo, along ni bukan main-main",
            "Please don't, very dangerous!"
        }},
        { "proud_payment", new[] {
            "Wah, responsible betul!",
            "Tahniah! Bayar hutang on time!",
            "Good job, credit score naik ni!"
        }},
        { "excited_complete", new[] {
            "Syabas! Semua siap!",
            "Wah wah wah, hebat betul!",
            "Complete all objectives, power la you!"
        }}
    };

    public string Generate(Choice choice, RobotEmotion emotion)
    {
        string key = GetDialogueKey(choice, emotion);

        if (dialogueTemplates.TryGetValue(key, out string[] templates))
        {
            return templates[Random.Range(0, templates.Length)];
        }

        return GetDefaultDialogue(emotion);
    }

    private string GetDialogueKey(Choice choice, RobotEmotion emotion)
    {
        if (choice.context.Contains("save") && emotion == RobotEmotion.Happy)
            return "happy_save";
        if (choice.context.Contains("maggi") && emotion == RobotEmotion.Sad)
            return "sad_maggi";
        if (choice.context.Contains("along"))
            return "scared_along";
        if (choice.context.Contains("debt") && choice.creditChange > 0)
            return "proud_payment";

        return $"{emotion.ToString().ToLower()}_default";
    }

    private string GetDefaultDialogue(RobotEmotion emotion)
    {
        return emotion switch
        {
            RobotEmotion.Happy => "Good choice!",
            RobotEmotion.Sad => "Hmm, boleh buat better next time",
            RobotEmotion.Worried => "Be careful ah...",
            RobotEmotion.Proud => "Well done!",
            _ => "Okay okay..."
        };
    }
}
```

---

## 3. Shared Backend Architecture

### 3.1 API Contract (Same for Both Platforms)

```yaml
# OpenAPI Specification
openapi: 3.0.0
info:
  title: Pak Ali Robot API
  version: 1.0.0

paths:
  /api/robot/events:
    get:
      summary: Poll for unprocessed robot events
      parameters:
        - name: gameId
          in: query
          required: true
          schema:
            type: string
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  events:
                    type: array
                    items:
                      $ref: '#/components/schemas/RobotEvent'

    post:
      summary: Create new robot event
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RobotEvent'
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: string

  /api/robot/events/ack:
    post:
      summary: Acknowledge events as processed
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                eventIds:
                  type: array
                  items:
                    type: string

  /api/robot/events/stream:
    get:
      summary: SSE stream for real-time events
      parameters:
        - name: gameId
          in: query
          required: true

  /api/robot/tts:
    post:
      summary: Generate TTS audio for dialogue
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                text: string
                voice: string
      responses:
        200:
          content:
            audio/mpeg:
              schema:
                type: string
                format: binary

components:
  schemas:
    RobotEvent:
      type: object
      properties:
        id:
          type: string
        gameId:
          type: string
        eventType:
          type: string
          enum: [decision, purchase, stat_change, milestone, game_over]
        emotion:
          type: string
          enum: [happy, sad, worried, proud, excited, disappointed, scared, neutral]
        animationId:
          type: string
        dialogue:
          type: string
        data:
          type: object
        isProcessed:
          type: boolean
        createdAt:
          type: number
```

### 3.2 Database Schema

```sql
-- Convex schema (both platforms write to same DB)
robotEvents {
  _id: Id<"robotEvents">
  gameId: Id<"games">
  eventType: string        -- "decision" | "purchase" | "stat_change" | "milestone" | "game_over"
  emotion: string          -- "happy" | "sad" | "worried" | "proud" | "excited" | "disappointed" | "scared"
  animationId: string      -- "wag_tail" | "head_down" | "crouch" | "celebrate" | "jump" | "turn_away" | "shake"
  dialogue?: string        -- Manglish text for TTS
  data?: any               -- Additional context
  isProcessed: boolean     -- Has robot received this?
  createdAt: number        -- Unix timestamp
}

-- Indexes
by_game: [gameId]
by_unprocessed: [gameId, isProcessed]
```

---

## 4. Robot Hardware Flow

### 4.1 ESP32 State Machine

```
                    ┌─────────────────┐
                    │     BOOT        │
                    │  Initialize     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
              ┌────►│   CONNECTING    │◄────┐
              │     │   WiFi Setup    │     │
              │     └────────┬────────┘     │
              │              │              │
              │   Fail       │ Success     │ Disconnect
              │              ▼              │
              │     ┌─────────────────┐     │
              │     │    PAIRING      │     │
              │     │  Wait for Game  │     │
              │     │  ID via BLE/QR  │     │
              │     └────────┬────────┘     │
              │              │              │
              │              │ Game ID Set  │
              │              ▼              │
              │     ┌─────────────────┐     │
              └─────│     IDLE        │─────┘
                    │  Poll for Events│
                    └────────┬────────┘
                             │
                             │ Event Received
                             ▼
                    ┌─────────────────┐
                    │   ANIMATING     │
                    │  Play Animation │
                    │  + TTS Audio    │
                    └────────┬────────┘
                             │
                             │ Complete
                             ▼
                    ┌─────────────────┐
                    │  ACKNOWLEDGE    │
                    │  POST /ack      │
                    └────────┬────────┘
                             │
                             │
                             ▼
                         [IDLE]
```

### 4.2 Hardware Communication

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ESP32 ROBOT CONTROLLER                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │   WiFi      │    │  Bluetooth  │    │   Serial    │                │
│   │  Module     │    │    BLE      │    │   Debug     │                │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                │
│          │                  │                  │                        │
│          └──────────────────┼──────────────────┘                        │
│                             │                                           │
│                    ┌────────┴────────┐                                  │
│                    │   Main Loop     │                                  │
│                    │   Controller    │                                  │
│                    └────────┬────────┘                                  │
│                             │                                           │
│          ┌──────────────────┼──────────────────┐                        │
│          │                  │                  │                        │
│   ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐                │
│   │   Servo     │    │   Audio     │    │    LED      │                │
│   │  Controller │    │  DFPlayer   │    │  Controller │                │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                │
│          │                  │                  │                        │
└──────────┼──────────────────┼──────────────────┼────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌────────────┐     ┌────────────┐     ┌────────────┐
    │  4x Servos │     │  Speaker   │     │  RGB LEDs  │
    │  (Movement)│     │  (TTS/SFX) │     │  (Emotion) │
    └────────────┘     └────────────┘     └────────────┘
```

### 4.3 Animation to Servo Mapping

```cpp
// Animation definitions
struct Animation {
    const char* name;
    int duration_ms;
    ServoKeyframe* keyframes;
    int keyframe_count;
    uint32_t led_color;
    const char* sound_file;
};

Animation animations[] = {
    // Happy - Wag tail
    {
        "wag_tail",
        2000,
        (ServoKeyframe[]){
            {0, {90, 90, 90, 45}},    // Start
            {250, {90, 90, 90, 135}}, // Tail right
            {500, {90, 90, 90, 45}},  // Tail left
            {750, {90, 90, 90, 135}}, // Tail right
            {1000, {90, 90, 90, 45}}, // Tail left
        },
        5,
        0x00FF00, // Green
        "happy.mp3"
    },

    // Sad - Head down
    {
        "head_down",
        1500,
        (ServoKeyframe[]){
            {0, {90, 90, 90, 90}},
            {500, {60, 90, 90, 90}},  // Head down
            {1500, {60, 90, 90, 90}}, // Hold
        },
        3,
        0x0000FF, // Blue
        "sad.mp3"
    },

    // Worried - Crouch
    {
        "crouch",
        2000,
        (ServoKeyframe[]){
            {0, {90, 90, 90, 90}},
            {500, {70, 120, 120, 70}}, // Crouch down
            {1500, {70, 120, 120, 70}},
        },
        3,
        0xFFFF00, // Yellow
        "worried.mp3"
    },

    // Proud - Celebrate
    {
        "celebrate",
        3000,
        (ServoKeyframe[]){
            {0, {90, 90, 90, 90}},
            {300, {120, 60, 60, 90}},  // Stand tall
            {600, {90, 90, 90, 90}},
            {900, {120, 60, 60, 90}},
            {1200, {90, 90, 90, 90}},
        },
        5,
        0xFF00FF, // Purple
        "celebrate.mp3"
    },

    // Scared - Shake
    {
        "shake",
        2000,
        (ServoKeyframe[]){
            {0, {90, 90, 90, 90}},
            {100, {85, 95, 95, 85}},
            {200, {95, 85, 85, 95}},
            {300, {85, 95, 95, 85}},
            // ... rapid oscillation
        },
        10,
        0xFF0000, // Red
        "scared.mp3"
    }
};
```

---

## 5. Sequence Diagrams

### 5.1 Complete Flow - Player Buys Maggi

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Player │ │Game UI │ │ Convex │ │Robot   │ │  API   │ │  ESP32 │ │  Robot │
│        │ │        │ │        │ │Events  │ │        │ │        │ │  Body  │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │          │          │          │
    │ Tap "Buy │          │          │          │          │          │
    │ Maggi"   │          │          │          │          │          │
    ├─────────►│          │          │          │          │          │
    │          │          │          │          │          │          │
    │          │makeDecision()       │          │          │          │
    │          ├─────────►│          │          │          │          │
    │          │          │          │          │          │          │
    │          │          │ Update game        │          │          │
    │          │          │ money: -30         │          │          │
    │          │          │ health: -5         │          │          │
    │          │          ├──┐       │          │          │          │
    │          │          │  │       │          │          │          │
    │          │          │◄─┘       │          │          │          │
    │          │          │          │          │          │          │
    │          │          │emitRobotEvent()    │          │          │
    │          │          ├─────────►│          │          │          │
    │          │          │          │          │          │          │
    │          │          │          │ {        │          │          │
    │          │          │          │  emotion:│          │          │
    │          │          │          │  "sad",  │          │          │
    │          │          │          │  anim:   │          │          │
    │          │          │          │"head_down"│         │          │
    │          │          │          │  dialogue│          │          │
    │          │          │          │"Aiyah,   │          │          │
    │          │          │          │ sayur la"│          │          │
    │          │          │          │ }        │          │          │
    │          │          │          ├──┐       │          │          │
    │          │          │          │  │ Store │          │          │
    │          │          │          │◄─┘       │          │          │
    │          │          │          │          │          │          │
    │          │ {success}│          │          │          │          │
    │          │◄─────────┤          │          │          │          │
    │          │          │          │          │          │          │
    │ UI shows │          │          │          │          │          │
    │ result   │          │          │          │          │          │
    │◄─────────┤          │          │          │          │          │
    │          │          │          │          │          │          │
    │          │          │          │          │GET /events│         │
    │          │          │          │          │◄─────────┤          │
    │          │          │          │          │          │          │
    │          │          │          │ Query    │          │          │
    │          │          │          │◄─────────┤          │          │
    │          │          │          │          │          │          │
    │          │          │          │ events[] │          │          │
    │          │          │          ├─────────►│          │          │
    │          │          │          │          │          │          │
    │          │          │          │          │ events[] │          │
    │          │          │          │          ├─────────►│          │
    │          │          │          │          │          │          │
    │          │          │          │          │          │Play anim │
    │          │          │          │          │          ├─────────►│
    │          │          │          │          │          │          │
    │          │          │          │          │          │ Head     │
    │          │          │          │          │          │ down +   │
    │          │          │          │          │          │ "Aiyah"  │
    │          │          │          │          │          │ audio    │
    │          │          │          │          │          │          │
    │          │          │          │          │POST /ack │          │
    │          │          │          │          │◄─────────┤          │
    │          │          │          │          │          │          │
    │          │          │          │markProcessed()      │          │
    │          │          │          │◄─────────┤          │          │
    │          │          │          │          │          │          │
```

### 5.2 Game Over Celebration

```
Week 4 Complete
      │
      ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Calculate      │────►│  Emit Multiple  │────►│  Robot Queues   │
│  Final Score    │     │  Robot Events   │     │  All Events     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
      ┌───────────┐       ┌───────────┐       ┌───────────┐
      │ Summary   │       │ Emotion   │       │ Final     │
      │ Event     │       │ Event     │       │ Message   │
      │ (stats)   │       │ (result)  │       │ (dialogue)│
      └───────────┘       └───────────┘       └───────────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   Robot Plays       │
                    │   Sequence:         │
                    │   1. Stats display  │
                    │   2. Happy/Sad anim │
                    │   3. Final speech   │
                    └─────────────────────┘
```

---

## Summary

| Aspect | Next.js (Now) | Unity (Later) |
|--------|---------------|---------------|
| **Event Emission** | Convex mutations | REST API calls |
| **Real-time** | Convex subscriptions | WebSocket/SSE |
| **Robot Connection** | Web dashboard + QR | Same + Bluetooth |
| **Local Fallback** | None | Direct BLE to robot |
| **Backend** | **Same Convex + API** | **Same Convex + API** |
| **Robot Hardware** | **Same ESP32 code** | **Same ESP32 code** |

The key insight is that **the backend and robot firmware stay identical** - only the game client changes between platforms.
