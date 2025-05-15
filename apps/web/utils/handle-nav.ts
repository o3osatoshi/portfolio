import { type Search, getQueryingPathName } from "@/utils/fetch-client";

type WebAlias = "signin" | "core" | "core-crud";

type ApiAlias = "core-posts";

type Alias = WebAlias | ApiAlias;

interface WebNav {
  alias: WebAlias;
  pathName: string;
  type: "web";
  data: {
    label: string;
    hierarchy: number;
    parentAlias?: WebAlias;
  };
}

interface ApiNav {
  alias: ApiAlias;
  pathName: string;
  type: "api";
}

type Nav = WebNav | ApiNav;

const navs: Nav[] = [
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
      label: "CRUD",
      hierarchy: 2,
      parentAlias: "core",
    },
  },
  {
    alias: "core-posts",
    pathName: "/api/core/posts",
    type: "api",
  },
];

export function getPathName(alias: Alias): string {
  const _nav = navs.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  return _nav.pathName;
}

export function getLabel(alias: WebAlias): string {
  const _nav = navs.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  if (_nav.type !== "web") throw new Error("alias not web");
  return _nav.data.label;
}

export function getTag(alias: ApiAlias, search?: Search) {
  const _path = getPathName(alias);
  return getQueryingPathName(_path, search);
}

export function findNavs(pathName: string): WebNav[] | undefined {
  let _nav = navs.find((n) => n.pathName === pathName);
  if (_nav === undefined || _nav.type !== "web") return undefined;

  const _navs: WebNav[] = [_nav];

  while (_nav?.type === "web" && _nav.data.hierarchy !== 1) {
    const parentAlias: string | undefined = _nav.data.parentAlias;
    if (parentAlias === undefined) break;
    _nav = navs.find((n) => n.alias === parentAlias);
    if (_nav === undefined || _nav.type !== "web") break;
    _navs.push(_nav);
  }

  return _navs.reverse();
}
