import { SeenSet, makeSet } from "./SeenSet";
import { timer } from "./Timer";
import { log } from "./log";

const timeJSSet = () => {
  let myTimer = timer();
  myTimer.start();
  const s: Set<string> = new Set();
  for (let i = 0; i < 10000; i++) {
    const point = { x: i, y: i / 5 };
    s.add(JSON.stringify(point));
    s.has(JSON.stringify({ x: i / 7, y: i / 2 }));
  }
  log("Set<string>: t=" + myTimer.stop());
};

export const timeJavaHashset = () => {
  const myTimer = timer();
  myTimer.start();

  //@ts-ignore
  const s: any = new java.util.HashSet<string>();
  for (let i = 0; i < 10000; i++) {
    const point = { x: i, y: i / 5 };
    const point2 = { x: i / 7, y: i / 2 };

    s.add(JSON.stringify(point));
    s.contains(JSON.stringify(point2));
  }
  log("Java.HashSet<string>: t=" + myTimer.stop());
};

export const timeJavaHashsetTupled = () => {
  const myTimer = timer();
  myTimer.start();

  //@ts-ignore
  const s: any = new java.util.HashSet<string>();
  for (let i = 0; i < 10000; i++) {
    const point = { x: i, y: i / 5 };
    const point2 = { x: i / 7, y: i / 2 };

    s.add(JSON.stringify([point.x, point.y]));
    s.contains(JSON.stringify([point2.x, point2.y]));
  }
  log("Java.HashSet<string> with Tupling: t=" + myTimer.stop());
};

const timeJSArray = () => {
  const myTimer = timer();
  myTimer.start();

  //@ts-ignore
  const s: string[] = [];
  for (let i = 0; i < 10000; i++) {
    const point = { x: i, y: i / 5 };
    s.push(JSON.stringify(point));
    s.indexOf(JSON.stringify({ x: i / 7, y: i / 2 })) !== -1;
  }
  log("JS array indexOf: t=" + myTimer.stop());
};

export const timePointSet = () => {
  const myTimer = timer();
  myTimer.start();

  //@ts-ignore
  const s: SeenSet = makeSet();
  for (let i = 0; i < 10000; i++) {
    const point = { x: i, y: i / 5 };
    const point2 = { x: i / 7, y: i / 2 };

    s.add(point);
    s.has(point2);
  }
  log("SeenSet<Point> t=" + myTimer.stop());
};
