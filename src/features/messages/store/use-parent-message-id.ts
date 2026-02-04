import { useQueryState } from "nuqs";

export const useParentMessageId = () => {
    return useQueryState("parentMessageId", {
        history: "replace",
        shallow: true,
        throttleMs: 500,
    });
};
