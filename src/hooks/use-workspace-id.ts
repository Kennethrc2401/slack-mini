import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

export const useWorkspaceId = (): Id<"workspaces"> => {
    const params = useParams();

    return params.workSpaceId as Id<"workspaces">;
};