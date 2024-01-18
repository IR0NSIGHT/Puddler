export const getTime = (): number => {
  //@ts-expect-error: provided by worldpainter context
  return java.lang.System.currentTimeMillis();
};

export const timer = () => {
  let t = 0;
  return {
    start: () => {
      t = getTime();
    },
    stop: () => {
      return getTime() - t;
    },
  };
};
