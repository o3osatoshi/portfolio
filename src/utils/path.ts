type NavAlias = "core" | "core-crud" | "core-restricted";

interface Nav {
  alias: NavAlias;
  label: string;
  path: string;
  hierarchy: number;
}

const nav: Nav[] = [
  {
    alias: "core",
    label: "Core",
    path: "/core",
    hierarchy: 1,
  },
  {
    alias: "core-crud",
    label: "Serverside CRUD",
    path: "/core/crud",
    hierarchy: 2,
  },
  {
    alias: "core-restricted",
    label: "Restricted Access",
    path: "/core/restricted",
    hierarchy: 2,
  },
];

export function getPath(alias: NavAlias): string {
  const _nav = nav.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  return _nav.path;
}

export function getLabel(alias: NavAlias): string {
  const _nav = nav.find((n) => n.alias === alias);
  if (_nav === undefined) throw new Error("alias not found");
  return _nav.label;
}

export function resolveNav(path: string): Nav[] | undefined {
  return nav
    .filter((n) => path.includes(n.path))
    .sort((a, b) => a.hierarchy - b.hierarchy);
}
