import type {
  Category,
  CategoryId,
  Photo,
  Service,
  ServiceId,
} from "../models/types";
import { CATEGORY_IDS, SERVICE_IDS } from "../models/types";

export const services: Service[] = [
  {
    id: "classic",
    name: "Manicura refuerzo",
    shortName: "Manicura refuerzo",
    description:
      "Un acabado pensado para cuidar tus uñas naturales y darles una sensación más firme y prolija.",
    price: 25,
    duration: 40,
    note: "CUIDADO Y FIRMEZA",
  },
  {
    id: "acrylic",
    name: "Acrílicas",
    shortName: "Acrílicas",
    description:
      "Una nueva forma, un poco más de longitud y una perspectiva renovada. Un conjunto pensado para tu estilo.",
    price: 55,
    duration: 90,
    note: "DA FORMA A TU ESTILO",
  },
  {
    id: "nail-art",
    name: "Pedicura",
    shortName: "Pedicura",
    description:
      "Un momento dedicado al cuidado de tus pies, con detalles suaves y un acabado limpio.",
    price: 15,
    duration: 25,
    note: "CUIDADO PARA TUS PIES",
  },
];

export const photos: Photo[] = [
  {
    id: "soft-statement",
    image: "photo-1604654894610-df63bc536371",
    title: "Una declaración sutil",
    category: "gel",
    alt: "Manicura negra con uñas de acento carey y una manga de punto gris",
    position: "center",
  },
  {
    id: "little-details",
    image: "photo-1519014816548-bf5fe059798b",
    title: "Una pequeña nota de amor",
    category: "nail-art",
    alt: "Decoración de uñas roja con puntas en forma de corazón y letras blancas",
    position: "center",
  },
  {
    id: "modern-muse",
    image: "photo-1610992015732-2449b76344bc",
    title: "Musa moderna",
    category: "acrylic",
    alt: "Uñas rosa suave en forma de almendra sobre una superficie blanca con textura",
    position: "center",
  },
  {
    id: "less-is-more",
    image: "photo-1632345031435-8727f6897d53",
    title: "El ritual de cuidado",
    category: "classic",
    alt: "Una técnica de uñas aplicando esmalte durante una manicura",
    position: "center",
  },
  {
    id: "gloss-edit",
    image: "photo-1604654894610-df63bc536371",
    title: "El toque de brillo",
    category: "gel",
    alt: "Detalle de uñas negras brillantes y un acento carey",
    position: "60% 70%",
  },
  {
    id: "artful-moment",
    image: "photo-1632345031435-8727f6897d53",
    title: "Un momento creativo",
    category: "nail-art",
    alt: "Recorte de detalle de una sesión de manicura",
    position: "70% 65%",
  },
];

export const categories: Category[] = [
  { id: "all", label: "Toda la inspiración" },
  { id: "acrylic", label: "Acrílico" },
  { id: "gel", label: "Gel" },
  { id: "nail-art", label: "Decoración de uñas" },
  { id: "classic", label: "Clásica" },
];

export const demoTimes = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
] as const;
export type DemoTime = (typeof demoTimes)[number];

export function isServiceId(value: string | null): value is ServiceId {
  return SERVICE_IDS.includes(value as ServiceId);
}

export function isCategoryId(value: string | null): value is CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId);
}

export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
