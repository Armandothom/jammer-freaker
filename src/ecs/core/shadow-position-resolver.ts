type ShadowPosition = {
    x: number;
    y: number;
};

export function resolveShadowPosition(
    posX: number,
    posY: number,
    parentSpriteWidth: number,
    parentSpriteHeight: number,
    shadowWidth: number,
    shadowHeight: number,
    shadowSpriteOffsetY: number,
): ShadowPosition {
    const entityCenterX = posX + Math.floor(parentSpriteWidth / 2);
    const shadowX = entityCenterX - Math.floor(shadowWidth / 2);

    const entityFootY = posY + parentSpriteHeight;

    const shadowY = entityFootY - shadowHeight + shadowSpriteOffsetY;

    return {
        x: Math.round(shadowX),
        y: Math.round(shadowY),
    };
}