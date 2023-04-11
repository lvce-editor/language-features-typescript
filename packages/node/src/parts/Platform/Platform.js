import { join, resolve } from "path";
import * as Root from "../Root/Root.js";

export const state = {
  getDefaultTsServerPath() {
    return (
      process.env.TS_SERVER_PATH ||
      resolve(
        join(Root.root, "node_modules", "typescript", "lib", "tsserver.js")
      )
    );
  },
  getTsServerPath() {
    const configuredTsServerPath = vscode.getConfiguration(
      "typescript.tsserverPath"
    );
    if (configuredTsServerPath) {
      return configuredTsServerPath;
    }
    return this.getDefaultTsServerPath();
  },
};

export const getTsServerPath = () => {
  return state.getTsServerPath();
};

export const getDefaultTsServerPath = () => {
  return state.getDefaultTsServerPath();
};
