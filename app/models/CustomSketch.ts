import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { CIMSymbol } from "esri/symbols";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import Polyline from "esri/geometry/Polyline";
import MapView from "esri/views/MapView";

export interface SketchCreateEvent {
  graphic: Graphic;
  state: String;
  tool: String;
  toolEventInfo: {};
  type: "create";
}

export enum CurrentSelectedBtn {
  CirclePointBtn = "pointButtonNumber",
  PinBtn = "pinBtn",
  TrashBtn = "resetBtn",
  PolylineBtn = "polylineBtn",
  PolygonBtn = "polygonBtn",
}

interface ToMapPointer {
  x: Number;
  y: Number;
}

export class CustomSketch {
  constructor(public graphicsLayer: GraphicsLayer) {}

  addGraphic(
    event: SketchCreateEvent,
    selectedBtnId: string,
    index?: number
  ): void {
    if (event.state === "complete") {
      if (selectedBtnId === CurrentSelectedBtn.PinBtn) {
        this.graphicsLayer.remove(event.graphic);
        this.addPinBtn(event.graphic);
      } else if (selectedBtnId === CurrentSelectedBtn.CirclePointBtn) {
        // add the CIM Symbol
        this.graphicsLayer.remove(event.graphic);

        const cimSymbol = new CIMSymbol({
          data: this.getPointSymbolData(index),
        });

        const newGraphic = new Graphic({
          geometry: event.graphic.geometry,
          symbol: cimSymbol,
        });
        this.graphicsLayer.add(newGraphic);

        //sketchViewModel.create("point");
      }
    }
  }

  addPinBtn(graphic: Graphic): void {
    const pinSymbol = new SimpleMarkerSymbol({
      color: "#0079C1",
      size: "20px",
      path:
        "M15.999 0C11.214 0 8 1.805 8 6.5v17l7.999 8.5L24 23.5v-17C24 1.805 20.786 0 15.999 0zM16 14.402A4.4 4.4 0 0 1 11.601 10a4.4 4.4 0 1 1 8.798 0A4.4 4.4 0 0 1 16 14.402z",
    });

    const pinGraphic = new Graphic({
      geometry: graphic.geometry,
      symbol: pinSymbol,
    });
    this.graphicsLayer.add(pinGraphic);
    //model.create("point");
  }

  drawArrow(startPoint: any, endPoint: any, view: MapView): [Graphic, Graphic] {
    const start = view.toMap(startPoint),
      end = view.toMap(endPoint);

    const lineGraphic = new Graphic({
      geometry: new Polyline({
        paths: [
          [
            [start.x, start.y],
            [end.x, end.y],
          ],
        ],
        spatialReference: { wkid: 102100 },
      }),
      symbol: new SimpleLineSymbol({
        color: "#0079C1",
        width: "3px",
        style: "solid",
      }),
      // attributes added for identifying the arrow graphics
      // for easy deletion
      attributes: {
        type: "arrow-line",
      },
    });

    let dx = end.x - start.x,
      dy = end.y - start.y,
      rads = Math.atan2(dy, dx);

    if (rads < 0) {
      rads = Math.abs(rads);
    } else {
      rads = 2 * Math.PI - rads;
    }

    const degrees = (rads * 180) / Math.PI + 180;

    const arrowHeadGraphic = new Graphic({
      symbol: new PictureMarkerSymbol({
        url:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTcxLjgxNXB4IiBoZWlnaHQ9IjU3MS44MTVweCIgdmlld0JveD0iMCAwIDU3MS44MTUgNTcxLjgxNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTcxLjgxNSA1NzEuODE1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTExNy41MTgsMjk2LjA0MmwzMzMuMTYxLDI3Mi4xMzJjOC4yODYsNi42NDYsMTIuMDYyLDMuOTQxLDguNDMtNi4wNGwtODguNDQyLTI2MC4wNDkgICAgYy0zLjYzLTkuOTgxLTMuNTk2LTI2LjE1NiwwLjA3Ni0zNi4xMjNsODguMjktMjU2LjI2YzMuNjcyLTkuOTY2LTAuMTAxLTEyLjcwMi04LjQzMS02LjExTDExNy41OTQsMjcyLjA3ICAgIEMxMDkuMjY1LDI3OC42NjEsMTA5LjIzMSwyODkuMzk1LDExNy41MTgsMjk2LjA0MnoiLz4KCTwvZz4KPC9nPgo8L3N2Zz4=",
        angle: degrees,
      }),
      geometry: end,
      attributes: {
        type: "arrow-head",
      },
    });

    return [lineGraphic, arrowHeadGraphic];
  }

  getPointSymbolData(index: number): {} {
    return {
      type: "CIMPointSymbol",
      symbolLayers: [
        {
          type: "CIMVectorMarker",
          enable: true,
          size: 20,
          colorLocked: true,
          anchorPointUnits: "Relative",
          frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: { x: 0, y: 0 },
              symbol: {
                type: "CIMTextSymbol",
                fontFamilyName: "Arial",
                fontStyleName: "Bold",
                height: 4,
                horizontalAlignment: "Center",
                offsetX: 0,
                offsetY: 5,
                symbol: {
                  type: "CIMPolygonSymbol",
                  symbolLayers: [
                    {
                      type: "CIMSolidFill",
                      enable: true,
                      color: [255, 255, 255, 255],
                    },
                  ],
                },
                verticalAlignment: "Center",
              },
              textString: String(index++),
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
        {
          type: "CIMVectorMarker",
          enable: true,
          anchorPoint: { x: 0, y: -0.5 },
          anchorPointUnits: "Relative",
          size: 20,
          frame: { xmin: 0.0, ymin: 0.0, xmax: 17.0, ymax: 17.0 },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: {
                rings: [
                  [
                    [8.5, 0.2],
                    [7.06, 0.33],
                    [5.66, 0.7],
                    [4.35, 1.31],
                    [3.16, 2.14],
                    [2.14, 3.16],
                    [1.31, 4.35],
                    [0.7, 5.66],
                    [0.33, 7.06],
                    [0.2, 8.5],
                    [0.33, 9.94],
                    [0.7, 11.34],
                    [1.31, 12.65],
                    [2.14, 13.84],
                    [3.16, 14.86],
                    [4.35, 15.69],
                    [5.66, 16.3],
                    [7.06, 16.67],
                    [8.5, 16.8],
                    [9.94, 16.67],
                    [11.34, 16.3],
                    [12.65, 15.69],
                    [13.84, 14.86],
                    [14.86, 13.84],
                    [15.69, 12.65],
                    [16.3, 11.34],
                    [16.67, 9.94],
                    [16.8, 8.5],
                    [16.67, 7.06],
                    [16.3, 5.66],
                    [15.69, 4.35],
                    [14.86, 3.16],
                    [13.84, 2.14],
                    [12.65, 1.31],
                    [11.34, 0.7],
                    [9.94, 0.33],
                    [8.5, 0.2],
                  ],
                ],
              },
              symbol: {
                type: "CIMPolygonSymbol",
                symbolLayers: [
                  {
                    type: "CIMSolidFill",
                    enable: true,
                    color: [39, 129, 153, 255],
                  },
                ],
              },
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
      ],
    };
  }
}
