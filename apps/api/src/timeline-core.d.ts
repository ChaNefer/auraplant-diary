declare module "@monodiary/timeline-core" {
  import type { ZodTypeAny } from "zod";

  export const WorkspaceKindSchema: ZodTypeAny;
  export const CreateWorkspaceSchema: ZodTypeAny;
  export const CreateEntitySchema: ZodTypeAny;
  export const TransferEntitySchema: ZodTypeAny;
  export const EventInputSchema: ZodTypeAny;
  export const TimelineQuerySchema: ZodTypeAny;
  export const SYSTEM_EVENT_TYPES: {
    readonly void: "system.void";
    readonly correction: "system.correction";
  };
}
