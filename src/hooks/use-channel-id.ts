import { useParams } from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

export const useChannelId = (): Id<"channels"> => {
    const params = useParams();

    return params.channelId as Id<"channels">;
};

// import { useParams } from "next/navigation";
// import { Id } from "../../convex/_generated/dataModel";

// // Assuming Convex provides a utility for string to Id conversion
// const stringToChannelId = (id: string): Id<"channels"> => {
//     // Replace this with the correct way to obtain an Id<"channels">
//     return id as unknown as Id<"channels">;
// };

// export const useChannelId = (): Id<"channels"> | null => {
//     const params = useParams();
//     const channelId = params.channelId;

//     if (typeof channelId === "string") {
//         // Use the conversion utility if you have it
//         return stringToChannelId(channelId);
//     }

//     // Return null if channelId is invalid
//     return null;
// };
