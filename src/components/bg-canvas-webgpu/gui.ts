import { Pane } from "tweakpane"
import { modeQty } from "./fragment-shader"

export interface GuiData {
  forcedModeIndex: number
  tinted: true
  colorA: Record<"r" | "g" | "b", number>
  colorB: Record<"r" | "g" | "b", number>
  frameTimeMs: number
}

export function createGui(guiData: GuiData) {
  const bgMode = localStorage.getItem("bgMode")
  if (bgMode !== null) guiData.forcedModeIndex = +bgMode

  const pane = new Pane()

  pane
    .addBinding(guiData, "forcedModeIndex", {
      min: -1,
      max: modeQty - 1,
      step: 1,
      label: "Mode",
    })
    .on("change", ({ value }) =>
      localStorage.setItem("bgMode", value.toString()),
    )

  pane.addBlade({ view: "separator" })

  pane.addBinding(guiData, "tinted", { label: "Tinted" })
  pane.addBinding(guiData, "colorA", { label: "Color A" })
  pane.addBinding(guiData, "colorB", { label: "Color B" })

  pane.addBlade({ view: "separator" })

  pane.addBinding(guiData, "frameTimeMs", {
    label: "Frame ms",
    readonly: true,
  })
  pane.addBinding(guiData, "frameTimeMs", {
    label: "Frame FPS",
    readonly: true,
    format: (value) => `${(1000 / value).toFixed(0)}`,
  })
}
