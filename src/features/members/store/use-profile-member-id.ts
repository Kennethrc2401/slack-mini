import { useQueryState } from "nuqs";

export const useProfileMemberId = () => {
    return useQueryState("profileMemberId", {
        history: "replace",
        shallow: true,
        throttleMs: 500,
    });
};
