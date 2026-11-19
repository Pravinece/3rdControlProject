import { create } from "zustand";

/**
 * ANIMATION KEYS  (match the names you assign in Avatar.jsx)
 * "idle"            → built-in GLB animation
 * "walk"            → Walking.fbx
 * "run"             → Runing.fbx
 * "jump"            → Jumping.fbx
 * "sit"             → Sitting.fbx
 * "standToSit"      → Stand_To_Sit.fbx
 * "sitToStand"      → Sit_To_Stand.fbx
 * "talk"            → Talking.fbx
 * "talk2"           → Talking2.fbx
 * "sittingTalking"  → Sitting_Talking.fbx
 * "listen"          → Listening_To_Music.fbx
 * "walkCircle"      → Walk_In_Circle.fbx
 */

/**
 * TASK TYPES
 * "idle"      → just stand/idle at current position
 * "walk"      → walk to a target position, then idle
 * "talk"      → walk to position → play talk animation + show message
 * "sit"       → walk to position → standToSit → sitting
 * "sitTalk"   → walk to position → standToSit → sittingTalking + message
 */

const useAvatarStore = create((set, get) => ({
  // whether the experience has started
  started: false,
  setStarted: (started) => set({ started }),

  // current playing animation
  animation: "idle",

  // current task the avatar is executing
  // { type, targetPosition, message, onComplete }
  currentTask: null,

  // queued tasks to run one after another
  taskQueue: [],

  // talking message to display in UI
  message: null,

  // ─── internal: set animation directly ───────────────────────────────────────
  setAnimation: (animation) => set({ animation }),

  // ─── internal: set message ──────────────────────────────────────────────────
  setMessage: (message) => set({ message }),

  // ─── queue a task ───────────────────────────────────────────────────────────
  queueTask: (task) =>
    set((state) => {
      const queue = [...state.taskQueue, task];
      // if nothing is running, start immediately
      if (!state.currentTask) {
        const [next, ...rest] = queue;
        return { taskQueue: rest, currentTask: next };
      }
      return { taskQueue: queue };
    }),

  // ─── called by CharacterControl when a task finishes ────────────────────────
  completeTask: () =>
    set((state) => {
      state.currentTask?.onComplete?.();
      const [next, ...rest] = state.taskQueue;
      return {
        currentTask: next ?? null,
        taskQueue: rest,
        // if nothing next, go idle
        animation: next ? state.animation : "idle",
        message: next ? state.message : null,
      };
    }),

  // ─── HELPER ACTIONS (call these from anywhere in your app) ──────────────────

  /** Just play an animation in place */
  playAnimation: (animKey) => {
    set({ animation: animKey, currentTask: null, taskQueue: [] });
  },

  /** Walk avatar to a position, then idle */
  walkTo: (targetPosition, onComplete) => {
    get().queueTask({ type: "walk", targetPosition, onComplete });
  },

  /** Walk to position, then talk with a message */
  talkAt: (targetPosition, message, onComplete) => {
    get().queueTask({ type: "talk", targetPosition, message, onComplete });
  },

  /** Walk to position, sit down */
  sitAt: (targetPosition, onComplete) => {
    get().queueTask({ type: "sit", targetPosition, onComplete });
  },

  /** Walk to position, sit, then talk */
  sitAndTalk: (targetPosition, message, onComplete) => {
    get().queueTask({ type: "sitTalk", targetPosition, message, onComplete });
  },

  /** Stop everything, go idle */
  reset: () =>
    set({ animation: "idle", currentTask: null, taskQueue: [], message: null }),
}));

export default useAvatarStore;
