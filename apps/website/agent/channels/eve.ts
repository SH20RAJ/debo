import { type AuthFn, localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

function deboSession(): AuthFn<Request> {
  return async (request) => {
    const userId = request.headers.get("x-debo-user-id");
    const workspaceId = request.headers.get("x-debo-workspace-id");
    if (!userId) return null;
    return {
      attributes: { workspaceId: workspaceId || "" },
      authenticator: "debo",
      principalId: userId,
      principalType: "user",
    };
  };
}

export default eveChannel({
  auth: [deboSession(), localDev()],
});
