import { getQueryPath, type Search } from "@/utils/next-fetch";

type Alias = ApiAlias | WebAlias;

type ApiAlias = "heavy-process-cached" | "labs-transactions" | "me";

interface ApiNav {
  alias: ApiAlias;
  pathName: string;
  type: "api";
}

type Nav = ApiNav | WebNav;

type WebAlias =
  | "labs-server-crud"
  | "labs-web3-crud"
  | "labs"
  | "portfolio-about"
  | "portfolio-blog"
  | "portfolio"
  | "toolkit-asynchronous"
  | "toolkit-redis-cache"
  | "toolkit";

interface WebNav {
  alias: WebAlias;
  data: {
    hierarchy: number;
    parentAlias?: WebAlias;
  };
  pathName: string;
  type: "web";
}

const navs: Nav[] = [
  {
    alias: "portfolio",
    data: {
      hierarchy: 1,
    },
    pathName: "/portfolio",
    type: "web",
  },
  {
    alias: "portfolio-about",
    data: {
      hierarchy: 2,
      parentAlias: "portfolio",
    },
    pathName: "/portfolio/about",
    type: "web",
  },
  {
    alias: "portfolio-blog",
    data: {
      hierarchy: 2,
      parentAlias: "portfolio",
    },
    pathName: "/portfolio/blog",
    type: "web",
  },
  {
    alias: "labs",
    data: {
      hierarchy: 1,
    },
    pathName: "/labs",
    type: "web",
  },
  {
    alias: "labs-server-crud",
    data: {
      hierarchy: 2,
      parentAlias: "labs",
    },
    pathName: "/labs/server-crud",
    type: "web",
  },
  {
    alias: "labs-transactions",
    pathName: "/api/private/labs/transactions",
    type: "api",
  },
  {
    alias: "me",
    pathName: "/edge/private/me",
    type: "api",
  },
  {
    alias: "heavy-process-cached",
    pathName: "/edge/public/heavy/cached",
    type: "api",
  },
  {
    alias: "labs-web3-crud",
    data: {
      hierarchy: 2,
      parentAlias: "labs",
    },
    pathName: "/labs/web3-crud",
    type: "web",
  },
  {
    alias: "toolkit",
    data: {
      hierarchy: 1,
    },
    pathName: "/toolkit",
    type: "web",
  },
  {
    alias: "toolkit-asynchronous",
    data: {
      hierarchy: 2,
      parentAlias: "toolkit",
    },
    pathName: "/toolkit/asynchronous",
    type: "web",
  },
  {
    alias: "toolkit-redis-cache",
    data: {
      hierarchy: 2,
      parentAlias: "toolkit",
    },
    pathName: "/toolkit/redis-cache",
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

export function getPath(alias: Alias): string {
  const _nav = navs.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  return _nav.pathName;
}

export function getTag(alias: ApiAlias, search?: Search) {
  const _path = getPath(alias);
  return getQueryPath(_path, search);
}
