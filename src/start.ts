import { createStart } from "@tanstack/react-start";
import { attachAuthToken } from "@/lib/auth-attacher";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachAuthToken],
}));
