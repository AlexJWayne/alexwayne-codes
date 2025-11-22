import { Pane } from "tweakpane"
import { modeQty } from "./fragment-shader"

export interface GuiData {
  forcedModeIndex: number
  tinted: boolean
  colorA: Record<"r" | "g" | "b", number>
  colorB: Record<"r" | "g" | "b", number>
  frameTimeMs: number
}

export function createGui(guiData: GuiData) {
  const bgMode = localStorage.getItem("bgMode")
  if (bgMode !== null) guiData.forcedModeIndex = +bgMode

  const isTinted = localStorage.getItem("isTinted")
  if (isTinted !== null) guiData.tinted = isTinted === "true"

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

  pane
    .addBinding(guiData, "tinted", { label: "Tinted" })
    .on("change", ({ value }) =>
      localStorage.setItem("isTinted", value ? "true" : "false"),
    )
  pane.addBinding(guiData, "colorA", { label: "Color A" })
  pane.addBinding(guiData, "colorB", { label: "Color B" })

  pane.addBlade({ view: "separator" })

  pane.addBinding(guiData, "frameTimeMs", {
    label: "Frame ms",
    readonly: true,
  })
}
