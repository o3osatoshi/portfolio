import { getFullPath, Search } from "@/utils/fetch-client";

type WebAlias = "signin" | "core" | "core-crud" | "core-restricted";

type ApiAlias = "core-posts";

type Alias = WebAlias | ApiAlias;

type Nav =
  | {
      alias: WebAlias;
      pathName: string;
      type: "web";
      data: {
        label: string;
        hierarchy: number;
      };
    }
  | {
      alias: ApiAlias;
      pathName: string;
      type: "api";
    };

const nav: Nav[] = [
  {
    alias: "signin",
    pathName: "/signin",
    type: "web",
    data: {
      label: "Signin",
      hierarchy: 1,
    },
  },
  {
    alias: "core",
    pathName: "/core",
    type: "web",
    data: {
      label: "Core",
      hierarchy: 1,
    },
  },
  {
    alias: "core-crud",
    pathName: "/core/crud",
    type: "web",
    data: {
      label: "Serverside CRUD",
      hierarchy: 2,
    },
  },
  {
    alias: "core-restricted",
    pathName: "/core/restricted",
    type: "web",
    data: {
      label: "Restricted Access",
      hierarchy: 2,
    },
  },
  {
    alias: "core-posts",
    pathName: "/api/core/posts",
    type: "api",
  },
];

export function getPathName(alias: Alias): string {
  const _nav = nav.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  return _nav.pathName;
}

export function getLabel(alias: WebAlias): string {
  const _nav = nav.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  if (_nav.type !== "web") throw new Error("alias not web");
  return _nav.data.label;
}

export function getTag(alias: ApiAlias, search?: Search) {
  const _path = getPathName(alias);
  return getFullPath(_path, search);
}
