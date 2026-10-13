import { system } from "@minecraft/server";

/** Shows a form and retries while the player's UI is busy. */
export async function showForm(form, player, maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
        const result = await form.show(player);
        if (result.cancelationReason !== "UserBusy") return result;
        await new Promise(resolve => system.runTimeout(resolve, 5));
    }
    return { canceled: true, cancelationReason: "UserBusy" };
}
