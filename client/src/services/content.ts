import type {
  Category,
  CategoryId,
  Photo,
  Review,
  Service,
  ServiceId,
} from "../models/types";
import { CATEGORY_IDS, SERVICE_IDS } from "../models/types";

export const services: Service[] = [
  {
    id: "classic",
    name: "La manicura clásica",
    shortName: "Manicura clásica",
    description:
      "Un nuevo comienzo para tus manos. Limado, cuidado de cutículas y un acabado de esmalte sencillo y elegante.",
    price: 25,
    duration: 40,
    note: "SENCILLA Y ATEMPORAL",
  },
  {
    id: "gel",
    name: "El gel distintivo",
    shortName: "Manicura de gel",
    description:
      "Tu día a día, realzado. Un acabado de gel brillante en un tono que se siente totalmente tuyo.",
    price: 38,
    duration: 60,
    note: "UN BRILLO EXTRA",
  },
  {
    id: "acrylic",
    name: "El conjunto esculpido",
    shortName: "Extensiones acrílicas",
    description:
      "Una nueva forma, un poco más de longitud y una perspectiva renovada. Un conjunto pensado para tu estilo.",
    price: 55,
    duration: 90,
    note: "DA FORMA A TU ESTILO",
  },
  {
    id: "nail-art",
    name: "El detalle creativo",
    shortName: "Decoración de uñas",
    description:
      "Pequeños lienzos, posibilidades infinitas. Detalles personales, acentos divertidos y acabados creativos.",
    price: 15,
    duration: 25,
    note: "HAZLO PERSONAL · COMPLEMENTO",
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

export const exampleReviews: Review[] = [
  {
    id: "example-1",
    name: "Una pausa cotidiana",
    rating: 5,
    comment:
      "Un momento para bajar el ritmo, elegir un color bonito y salir sintiéndome más yo misma. Justo el tipo de ritual que me encanta.",
    style: "Manicura clásica",
    example: true,
  },
  {
    id: "example-2",
    name: "Un detalle para recordar",
    rating: 5,
    comment:
      "Tonos suaves, detalles cuidados y un toque diferente. Mi inspiración para un conjunto que combina con todo.",
    style: "Manicura de gel",
    example: true,
  },
  {
    id: "example-3",
    name: "Espacio para crear",
    rating: 4,
    comment:
      "Me encanta la idea de llevar un panel de inspiración y convertirlo en algo personal. Un lienzo pequeño para mucha personalidad.",
    style: "Decoración de uñas",
    example: true,
  },
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
