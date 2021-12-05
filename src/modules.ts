import fs from "fs";
import util from "util";

import { Command, Event, Module } from "./interfaces";

async function getAllModules(): Promise<Map<string, Module>> {
  const dirPath = `${__dirname}/modules/`;

  let files: string[] = await util.promisify(fs.readdir)(dirPath);
  files = files.map((name) => dirPath + name);

  const modules = await Promise.all(
    files.map(async (file: string): Promise<[string, Module]> => {
      const mod = (await import(file)).default as Module;
      return [mod.name, mod];
    })
  );

  return new Map(modules);
}

export async function loadModules(): Promise<ModuleStore> {
  const modulesList = await getAllModules();
  const modulesArray = Array.from(modulesList);

  function flattenProperty(largeArray: any[], property: string): any {
    // heh a lot of `any`
    return largeArray.reduce((pre: any, cur: any) => {
      const value = cur[1][property];
      if (value) {
        const vals = value.map((x: any) => [x.name, x]);
        return [...pre, ...vals];
      }

      return pre;
    }, []);
  }

  return {
    modules: modulesList,
    commands: new Map(flattenProperty(modulesArray, "commands")),
    events: new Map(flattenProperty(modulesArray, "events")),
  };
}

export interface ModuleStore {
  modules: Map<string, Module>;
  commands: Map<string, Command>;
  events: Map<string, Event>;
}
