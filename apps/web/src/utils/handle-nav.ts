import { getQueryingPathName, type Search } from "@/utils/fetch-client";

type Alias = ApiAlias | WebAlias;

type ApiAlias = "labs-transactions";

interface ApiNav {
  alias: ApiAlias;
  pathName: string;
  type: "api";
}

type Nav = ApiNav | WebNav;

type WebAlias =
  | "labs-limited-read"
  | "labs-server-crud"
  | "labs-web3-crud"
  | "labs"
  | "portfolio-about"
  | "portfolio-blog"
  | "portfolio"
  | "signin"
  | "toolkit-asynchronous"
  | "toolkit";

interface WebNav {
  alias: WebAlias;
  data: {
    hierarchy: number;
    label: string;
    parentAlias?: WebAlias;
  };
  pathName: string;
  type: "web";
}

const navs: Nav[] = [
  {
    alias: "signin",
    data: {
      hierarchy: 1,
      label: "Signin",
    },
    pathName: "/signin",
    type: "web",
  },
  {
    alias: "portfolio",
    data: {
      hierarchy: 1,
      label: "Portfolio",
    },
    pathName: "/portfolio",
    type: "web",
  },
  {
    alias: "portfolio-about",
    data: {
      hierarchy: 2,
      label: "About",
      parentAlias: "portfolio",
    },
    pathName: "/portfolio/about",
    type: "web",
  },
  {
    alias: "portfolio-blog",
    data: {
      hierarchy: 2,
      label: "Blog",
      parentAlias: "portfolio",
    },
    pathName: "/portfolio/blog",
    type: "web",
  },
  {
    alias: "labs",
    data: {
      hierarchy: 1,
      label: "Labs",
    },
    pathName: "/labs",
    type: "web",
  },
  {
    alias: "labs-server-crud",
    data: {
      hierarchy: 2,
      label: "Server Side CRUD",
      parentAlias: "labs",
    },
    pathName: "/labs/server-crud",
    type: "web",
  },
  {
    alias: "labs-limited-read",
    data: {
      hierarchy: 2,
      label: "Limited Read",
      parentAlias: "labs",
    },
    pathName: "/labs/limited-read",
    type: "web",
  },
  {
    alias: "labs-transactions",
    pathName: "/api/labs/transactions",
    type: "api",
  },
  {
    alias: "labs-web3-crud",
    data: {
      hierarchy: 2,
      label: "Web3 CRUD",
      parentAlias: "labs",
    },
    pathName: "/labs/web3-crud",
    type: "web",
  },
  {
    alias: "toolkit",
    data: {
      hierarchy: 1,
      label: "Toolkit",
    },
    pathName: "/toolkit",
    type: "web",
  },
  {
    alias: "toolkit-asynchronous",
    data: {
      hierarchy: 2,
      label: "Asynchronous",
      parentAlias: "toolkit",
    },
    pathName: "/toolkit/asynchronous",
    type: "web",
  },
];

export function findNavs(pathName: string): undefined | WebNav[] {
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

export function getLabel(alias: WebAlias): string {
  const _nav = navs.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  if (_nav.type !== "web") throw new Error("alias not web");
  return _nav.data.label;
}

export function getPathName(alias: Alias): string {
  const _nav = navs.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  return _nav.pathName;
}

export function getTag(alias: ApiAlias, search?: Search) {
  const _path = getPathName(alias);
  return getQueryingPathName(_path, search);
}
