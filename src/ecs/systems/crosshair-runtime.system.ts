import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { CrosshairPresenter } from "../../ui/presenters/crosshair.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { CROSSHAIR_NODE_IDS } from "../../ui/screens/node-ids/crosshair-node-ids.js";
import { ISystem } from "./system.interface.js";

export class CrosshairRuntimeSystem implements ISystem {
    private canvas: HTMLCanvasElement;
    private currentMousePosition: { x: number; y: number } | null = null;
    private lastAppliedViewModel: { x: number; y: number; radius: number; visible: boolean } | null = null;
    private uiNodeBinder: UINodeBinder | null = null;

    constructor(
        private uiRuntime: UIRuntime,
        private crosshairPresenter: CrosshairPresenter,
    ) {
        const canvas = document.querySelector("canvas");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("CrosshairRuntimeSystem: canvas not found in DOM.");
        }

        this.canvas = canvas;
        this.canvas.addEventListener("mousemove", this.updateMousePosition);
        this.canvas.addEventListener("mousedown", this.updateMousePosition);
    }

    public update(_deltaTime: number): void {
        if (!this.uiRuntime.getDocument().getNodeOrNull(CROSSHAIR_NODE_IDS.root)) {
            this.lastAppliedViewModel = null;
            return;
        }

        if (this.currentMousePosition) {
            this.crosshairPresenter.moveToMousePosition(
                this.currentMousePosition.x,
                this.currentMousePosition.y,
            );
        }

        const viewModel = this.crosshairPresenter.buildViewModel();
        if (
            this.lastAppliedViewModel
            && this.lastAppliedViewModel.x === viewModel.center.x
            && this.lastAppliedViewModel.y === viewModel.center.y
            && this.lastAppliedViewModel.radius === viewModel.radius
            && this.lastAppliedViewModel.visible === viewModel.visible
        ) {
            return;
        }

        const binder = this.getBinder();
        this.crosshairPresenter.applyViewModel(binder, viewModel);
        this.lastAppliedViewModel = {
            x: viewModel.center.x,
            y: viewModel.center.y,
            radius: viewModel.radius,
            visible: viewModel.visible,
        };
    }

    private getBinder(): UINodeBinder {
        if (!this.uiNodeBinder) {
            this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
        }

        return this.uiNodeBinder;
    }

    private updateMousePosition = (event: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.currentMousePosition = {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    };
}
