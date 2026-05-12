export const VICTORY_SCREEN_NODE_IDS = {
    root: "victory.overlay.root",
    background: "victory.overlay.background",
    victoryPrompt: {
        root: "victory.prompt.root",
        background: "victory.prompt.background",
        text: "victory.prompt.text",
    },
    missionStats: {
        root: "victory.prompt.mission.stats.root",
        text: "victory.prompt.mission.stats.text",
    },
    nextMissionButton: {
        root: "victory.prompt.next-mission-button.root",
    },
    goToShopHubButton: {
        root: "victory.prompt.goto-shop-hub-button.root",
    },
} as const;
