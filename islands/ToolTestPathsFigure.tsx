import { useState } from "react";
import { Figure, IsoPath, autoViewBox } from "../lib/iso";
import { BrowserTray, ComponentSlab, HtmlSheet, SIZES, ServerTower, spec } from "../lib/parts";

const COMPONENT = { x: 0, y: 20 };
const SERVER = { x: 0, y: 150 };
const BROWSER = { x: 220, y: 20 };
const HTML = { x: 120, y: 160 };

const SERVER_SIDE = SERVER.x + SIZES.server.w;
const TO_SERVER_X = 90;
const TO_SERVER_Y = SERVER.y + 30;
const FROM_SERVER_Y = SERVER.y + 52;

const VIEWBOX = autoViewBox(
  [
    spec("component", COMPONENT.x, COMPONENT.y),
    spec("server", SERVER.x, SERVER.y),
    spec("browser", BROWSER.x, BROWSER.y),
    spec("html", HTML.x, HTML.y),
  ],
  { pad: 0.08 },
);

type Path = "rest" | "csr" | "ssr";

const READOUT: Record<Path, string> = {
  rest: "rest · pick a helper",
  csr: "render() · mounts in the browser · no server",
  ssr: "renderSSR() · server sends HTML · browser picks it up",
};

export default function ToolTestPathsFigure() {
  const [path, setPath] = useState<Path>("rest");
  const csr = path === "csr";
  const ssr = path === "ssr";

  return (
    <Figure
      fig="1"
      title="Two ways into the browser"
      label={`Counter.tsrx, a server, an HTML sheet and a browser. ${
        csr ? "render() sends the component straight to the browser." : ssr ? "renderSSR() sends it through the server as HTML, then the browser picks it up." : "No path is lit."
      } Use the buttons below the drawing to pick a helper.`}
      hint="Pick a helper"
      readout={READOUT[path]}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={() => setPath("csr")} aria-pressed={csr}>
            render()
          </button>
          <button type="button" onClick={() => setPath("ssr")} aria-pressed={ssr}>
            renderSSR()
          </button>
        </>
      }
    >
      <ComponentSlab x={COMPONENT.x} y={COMPONENT.y} accent={path !== "rest"} />
      <ServerTower x={SERVER.x} y={SERVER.y} accent={ssr} />
      <IsoPath
        dashed
        accent={ssr}
        arrow
        points={[
          [TO_SERVER_X, COMPONENT.y + SIZES.component.d, SIZES.component.h],
          [TO_SERVER_X, TO_SERVER_Y, SIZES.component.h],
          [SERVER_SIDE, TO_SERVER_Y, SIZES.component.h],
        ]}
      />
      <BrowserTray x={BROWSER.x} y={BROWSER.y} accent={path !== "rest"} />
      <IsoPath dashed accent={csr} arrow points={[[120, 60, 10], [220, 60, 12]]} />
      <HtmlSheet x={HTML.x} y={HTML.y} accent={ssr} />
      <IsoPath dashed accent={ssr} arrow points={[[SERVER_SIDE, FROM_SERVER_Y, SIZES.html.h], [HTML.x, FROM_SERVER_Y, SIZES.html.h]]} />
      <IsoPath dashed accent={ssr} arrow points={[[190, 170, 2], [260, 130, 12]]} />
    </Figure>
  );
}
