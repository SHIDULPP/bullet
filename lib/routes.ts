export type RouteId = "manali-ladakh" | "munnar-vattavada";

export type RideRoute = {
  id: RouteId;
  label: string;
  shortLabel: string;
  image: string;
};

export const ROUTES: RideRoute[] = [
  {
    id: "manali-ladakh",
    label: "Manali → Ladakh",
    shortLabel: "Manali → Ladakh",
    image: "/route-manali-ladakh.png",
  },
  {
    id: "munnar-vattavada",
    label: "Munnar → Vattavada",
    shortLabel: "Munnar → Vattavada",
    image: "/route-munnar-vattavada.png",
  },
];

export function getRoute(id: RouteId): RideRoute {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0]!;
}
