export const isLocal = (nodeEnv: string | undefined) =>
  nodeEnv === "local" || nodeEnv === "" || !nodeEnv;
