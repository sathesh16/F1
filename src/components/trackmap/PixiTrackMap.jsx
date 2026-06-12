"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

import { TEAM_COLORS } from "@/utils/teamColors";

export default function PixiTrackMap({
  track,
  drivers,
}) {

  const containerRef = useRef(null);

  const appRef = useRef(null);

  const trackRef = useRef(null);

  const driverObjectsRef = useRef({});

  const animationRef = useRef(null);

  const [size, setSize] = useState({
    width: 1000,
    height: 700,
  });

  /*
   * Resize Observer
   */
  useEffect(() => {

    if (!containerRef.current) return;

    const observer =
      new ResizeObserver((entries) => {

        const rect =
          entries[0].contentRect;

        setSize({
          width: rect.width - 100,
          height: rect.height - 100,
        });

      });

    observer.observe(
      containerRef.current
    );

    return () =>
      observer.disconnect();

  }, []);

  /*
   * Create Pixi App
   */
  useEffect(() => {

    let mounted = true;

    async function init() {

      if (!containerRef.current)
        return;

      const app =
        new PIXI.Application();

      await app.init({
        width: size.width,
        height: size.height,
        backgroundAlpha: 0,
        antialias: true,
      });

      if (!mounted) return;

      containerRef.current.appendChild(
        app.canvas
      );

      appRef.current = app;

      startAnimation();

    }

    init();

    return () => {

      mounted = false;

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (appRef.current) {
        appRef.current.destroy(
          true
        );
      }

    };

  }, []);

  /*
   * Resize Canvas
   */
  useEffect(() => {

    if (!appRef.current)
      return;

    appRef.current.renderer.resize(
      size.width,
      size.height
    );

    drawTrack();

  }, [size, track]);

  /*
   * Draw Circuit
   */
  const drawTrack = () => {

    if (
      !appRef.current ||
      !track
    ) {
      return;
    }

    const app =
      appRef.current;

    if (trackRef.current) {

      app.stage.removeChild(
        trackRef.current
      );

      trackRef.current.destroy();

    }

    const graphics =
      new PIXI.Graphics();

    const path = [];

    track.points.forEach(
      (point) => {

        path.push(
          point.x *
            size.width,
          point.y *
            size.height
        );

      }
    );

    /*
     * Asphalt
     */
    graphics.poly(path);

    graphics.stroke({
      width: 24,
      color: 0x1f1f23,
      cap: "round",
      join: "round",
    });

    /*
     * Racing line
     */
    graphics.poly(path);

    graphics.stroke({
      width: 8,
      color: 0x3f3f46,
      cap: "round",
      join: "round",
    });

    app.stage.addChild(
      graphics
    );

    trackRef.current =
      graphics;

  };

  /*
   * Create Driver Objects
   */
  useEffect(() => {

    if (
      !appRef.current ||
      !drivers
    ) {
      return;
    }

    const app =
      appRef.current;

    drivers.forEach(
      (driver) => {

        if (
          driver.x == null ||
          driver.y == null
        ) {
          return;
        }

        if (
          driverObjectsRef.current[
            driver.code
          ]
        ) {
          return;
        }

        const container =
          new PIXI.Container();

        const color =
          TEAM_COLORS[
            driver.team
          ] || 0xffffff;

        const dot =
          new PIXI.Graphics();

        dot.circle(
          0,
          0,
          8
        );

        dot.fill(color);

        const label =
          new PIXI.Text({
            text: `${driver.position} ${driver.code}`,
            style: {
              fill: "#ffffff",
              fontSize: 12,
            },
          });

        label.anchor.set(
          0.5
        );

        label.y = -20;

        container.addChild(
          dot
        );

        container.addChild(
          label
        );

        app.stage.addChild(
          container
        );

        driverObjectsRef.current[
          driver.code
        ] = {
          container,
          label,

          currentX:
            driver.x *
            size.width,

          currentY:
            driver.y *
            size.height,

          targetX:
            driver.x *
            size.width,

          targetY:
            driver.y *
            size.height,
        };

      }
    );

  }, [drivers]);

  /*
   * Update Targets
   */
  useEffect(() => {

    if (!drivers)
      return;

    drivers.forEach(
      (driver) => {

        const obj =
          driverObjectsRef.current[
            driver.code
          ];

        if (!obj) return;

        obj.targetX =
          driver.x *
          size.width;

        obj.targetY =
          driver.y *
          size.height;

        obj.label.text =
          `P${driver.position} ${driver.code}`;

      }
    );

  }, [drivers, size]);

  /*
   * Smooth Animation
   */
  const startAnimation =
    () => {

      const animate =
        () => {

          Object.values(
            driverObjectsRef.current
          ).forEach(
            (driver) => {

              driver.currentX +=
                (
                  driver.targetX -
                  driver.currentX
                ) *
                0.15;

              driver.currentY +=
                (
                  driver.targetY -
                  driver.currentY
                ) *
                0.15;

              driver.container.x =
                driver.currentX;

              driver.container.y =
                driver.currentY;

            }
          );

          animationRef.current =
            requestAnimationFrame(
              animate
            );

        };

      animate();

    };

  return (
    <div
      ref={containerRef}
      className="
        w-full
        h-[600px]
        rounded-xl
      "
    />
  );

}