import { toSolidStartHandler } from "better-auth/solid-start";
import { auth } from "~/lib/auth-server";

export const { GET, POST } = toSolidStartHandler(auth);
