import { getQueryingPathName, type Search } from "@/utils/fetch-client";

type WebAlias =
  | "signin"
  | "portfolio"
  | "portfolio-about"
  | "portfolio-blog"
  | "labs"
  | "labs-server-crud"
  | "labs-limited-read"
  | "labs-web3-crud";

type ApiAlias = "labs-transactions";

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
    alias: "portfolio",
    pathName: "/portfolio",
    type: "web",
    data: {
      label: "Portfolio",
      hierarchy: 1,
    },
  },
  {
    alias: "portfolio-about",
    pathName: "/portfolio/about",
    type: "web",
    data: {
      label: "About",
      hierarchy: 2,
      parentAlias: "portfolio",
    },
  },
  {
    alias: "portfolio-blog",
    pathName: "/portfolio/blog",
    type: "web",
    data: {
      label: "Blog",
      hierarchy: 2,
      parentAlias: "portfolio",
    },
  },
  {
    alias: "labs",
    pathName: "/labs",
    type: "web",
    data: {
      label: "Labs",
      hierarchy: 1,
    },
  },
  {
    alias: "labs-server-crud",
    pathName: "/labs/server-crud",
    type: "web",
    data: {
      label: "Server Side CRUD",
      hierarchy: 2,
      parentAlias: "labs",
    },
  },
  {
    alias: "labs-limited-read",
    pathName: "/labs/limited-read",
    type: "web",
    data: {
      label: "Limited Read",
      hierarchy: 2,
      parentAlias: "labs",
    },
  },
  {
    alias: "labs-transactions",
    pathName: "/api/labs/transactions",
    type: "api",
  },
  {
    alias: "labs-web3-crud",
    pathName: "/labs/web3-crud",
    type: "web",
    data: {
      label: "Web3 CRUD",
      hierarchy: 2,
      parentAlias: "labs",
    },
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
