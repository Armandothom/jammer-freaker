# Miltiia Breaker

## UI Architecture

The project now uses a retained UI runtime with ECS as the rendering and input backend.

Flow:

`game state -> runner -> presenter -> view model -> screen/widget tree -> UI runtime/layout -> ECS sync -> render`

Main runtime files:

- `src/ui/runtime/ui-runtime.ts`: owns the active base screen plus overlay stack.
- `src/ui/runtime/ui-document.ts`: stores the built UI tree and resolved renderable/interactive nodes.
- `src/ui/layout/ui-layout-engine.ts`: resolves anchors, offsets, sizing, and child layout.
- `src/ecs/systems/ui-runtime-sync.system.ts`: syncs the UI document into ECS sprite/text entities.
- `src/ecs/systems/ui-runtime-input.system.ts`: reads mouse input, hit-tests the UI tree, and routes actions.

## Current Sources Of Truth

For each screen, these are the single sources of truth:

- Screen composition: `src/ui/screens/*.screen.ts`
- Reusable UI structure: `src/ui/widgets/*.widget.ts`
- Visual offsets, sprites, and sizing: `src/ui/style/*-skin-map.ts`
- Runtime data shape: `src/ui/view-models/*.view-model.ts`
- Domain-to-UI mapping: `src/ui/presenters/*.presenter.ts`
- UI actions: `src/ui/input/*.ts`
- Action side effects on game state: `src/ecs/core/*-action-controller.ts`
- Screen activation and lifetime: `src/ecs/core/*-system-runner.ts`

Current production screens:

- HUD:
  `src/ui/screens/hud.screen.ts`
  `src/ui/presenters/hud.presenter.ts`
  `src/ui/view-models/hud.view-model.ts`
  `src/ui/style/hud-skin-map.ts`
  Activated from `src/ecs/core/gameplay-system-runner.ts`
- Shop:
  `src/ui/screens/shop.screen.ts`
  `src/ui/presenters/shop.presenter.ts`
  `src/ui/view-models/shop.view-model.ts`
  `src/ui/style/shop-skin-map.ts`
  Activated from `src/ecs/core/shop-system-runner.ts`

Shared config that is still used by the new UI:

- Inventory resource icon sizes:
  `src/ecs/components/types/inventory-resource-sprite-config.ts`
- Shop dialog spawning:
  `src/ecs/entities/dialog-entity-factory.ts`
  `src/ecs/systems/shop-interaction-dialog.system.ts`

## Adding A New Screen

1. Create a screen in `src/ui/screens/my-screen.screen.ts` implementing `UIScreen`.
2. If the screen needs runtime data, add:
   `src/ui/view-models/my-screen.view-model.ts`
   `src/ui/presenters/my-screen.presenter.ts`
3. If the screen has custom visuals, add:
   `src/ui/style/my-screen-skin-map.ts`
4. If it has reusable parts, add widgets in:
   `src/ui/widgets/`
5. Register the screen in the owning runner:
   `uiRuntime.registerScreen(new MyScreen())`
6. Show it as the main screen with:
   `uiRuntime.setBaseScreen("my-screen")`
7. If it is interactive, add actions under `src/ui/input/` and handle them in a controller under `src/ecs/core/`.

In practice, you usually edit these files together:

- `src/ui/screens/*`
- `src/ui/presenters/*`
- `src/ui/view-models/*`
- `src/ui/style/*`
- `src/ui/widgets/*`
- `src/ecs/core/gameplay-system-runner.ts` or `src/ecs/core/shop-system-runner.ts`

## Adding A Widget To An Existing Screen

If you want to add a widget to an existing screen, the screen stays the composition root.

Typical flow:

1. Create or update a widget in `src/ui/widgets/*.widget.ts`.
2. Import that widget into the target screen in `src/ui/screens/*.screen.ts`.
3. Add a stable node id if the widget needs runtime updates:
   `src/ui/screens/hud-node-ids.ts`
   `src/ui/screens/shop-node-ids.ts`
4. If the widget is dynamic, extend the screen view model in `src/ui/view-models/*.view-model.ts`.
5. Map domain state into that widget data in `src/ui/presenters/*.presenter.ts`.
6. Patch the widget nodes from the owning runtime system:
   `src/ecs/systems/hud-runtime.system.ts`
   `src/ecs/systems/shop-runtime.system.ts`
7. If the widget is clickable, add actions under `src/ui/input/` and handle them in a controller under `src/ecs/core/`.

Rule of thumb:

- Static widget:
  only the widget file and the screen file usually change.
- Dynamic widget:
  widget, screen, node ids, view model, presenter, and runtime system change together.
- Interactive widget:
  the same as dynamic, plus input actions and an action controller.

Current single sources of truth when extending an existing screen:

- Widget structure: `src/ui/widgets/*.widget.ts`
- Screen composition: `src/ui/screens/*.screen.ts`
- Stable ids for patching: `src/ui/screens/*-node-ids.ts`
- Data shape: `src/ui/view-models/*.view-model.ts`
- Domain mapping: `src/ui/presenters/*.presenter.ts`
- Runtime patch logic: `src/ecs/systems/*-runtime.system.ts`
- Click/action handling: `src/ui/input/*.ts` and `src/ecs/core/*-action-controller.ts`

## Adding An Overlay

Overlays are stacked on top of the current base screen.

Register the overlay screen in the owning runner:

- `uiRuntime.registerScreen(new DeathOverlayScreen())`

Show it:

- `uiRuntime.pushOverlay("death-overlay")`

Hide it:

- `uiRuntime.popOverlay("death-overlay")`

Clear every overlay:

- `uiRuntime.clearOverlays()`

Base screen ownership does not change when an overlay is shown. For example, gameplay can keep `HudScreen` as the base screen while a death or pause overlay is pushed on top.

## Where To Call Screens And Overlays

Call `setBaseScreen`, `pushOverlay`, `popOverlay`, and `clearOverlays` from the system runner or orchestration layer that owns the corresponding `UIRuntime` instance.

Today that means:

- Gameplay UI changes belong in `src/ecs/core/gameplay-system-runner.ts`
- Shop UI changes belong in `src/ecs/core/shop-system-runner.ts`

If a future feature needs global routing across multiple game states, that routing should still decide screen activation from a runner or manager layer, not from inside a widget or presenter.
