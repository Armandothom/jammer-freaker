export const MISSION_SELECT_NODE_IDS = {
    background: "mission-select.background",
    buttons: {
        map: (mapId: string) => `mission-select.button.map.${mapId}`,
        returnToHub: "mission-select.button.return-to-hub",
    },
    menu: "mission-select.menu",
    root: "mission-select.root",
} as const;
