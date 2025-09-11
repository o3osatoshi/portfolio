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
