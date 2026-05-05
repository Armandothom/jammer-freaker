import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";

export type WeaponAttachmentBaseAnchor = {
    x: number;
    y: number;
};

export type WeaponAttachmentPose = WeaponAttachmentBaseAnchor & {
    barrelX: number;
    barrelY: number;
    dirX: number;
    dirY: number;
    effectiveAimAngle: number;
};

export function resolveWeaponAttachmentBaseAnchor(
    parentPosition: PositionComponent,
    parentSprite: SpriteComponent,
    attachment: WeaponSpriteAttachmentComponent,
): WeaponAttachmentBaseAnchor {
    return {
        x: parentPosition.x + attachment.offsetXAim * parentSprite.width / 32,
        y: parentPosition.y + attachment.offsetYAim * parentSprite.height / 32,
    };
}

export function resolveWeaponAttachmentPose(
    baseAnchor: WeaponAttachmentBaseAnchor,
    weaponSprite: SpriteComponent,
    aimAngle: number,
    options?: {
        back?: number;
        lift?: number;
        angleOffset?: number;
    },
): WeaponAttachmentPose {
    const back = options?.back ?? 0;
    const lift = options?.lift ?? 0;
    const angleOffset = options?.angleOffset ?? 0;
    const effectiveAimAngle = aimAngle + angleOffset;
    const dirX = Math.cos(effectiveAimAngle);
    const dirY = Math.sin(effectiveAimAngle);
    const perpX = -dirY;
    const perpY = dirX;
    const x = baseAnchor.x + (-dirX * back) + (perpX * lift);
    const y = baseAnchor.y + (-dirY * back) + (perpY * lift);

    return {
        x,
        y,
        barrelX: x + (weaponSprite.width * dirX),
        barrelY: y + (weaponSprite.width * dirY),
        dirX,
        dirY,
        effectiveAimAngle,
    };
}
