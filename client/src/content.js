export const services = [
  {
    id: "classic",
    name: "The classic manicure",
    shortName: "Classic manicure",
    description:
      "A fresh start for your hands. Shaping, cuticle care, and a beautifully simple polish finish.",
    price: 25,
    duration: 40,
    note: "EFFORTLESS & TIMELESS",
  },
  {
    id: "gel",
    name: "The signature gel",
    shortName: "Gel manicure",
    description:
      "Your everyday, elevated. A glossy gel finish in a shade that feels entirely like you.",
    price: 38,
    duration: 60,
    note: "A LITTLE EXTRA SHINE",
  },
  {
    id: "acrylic",
    name: "The sculpted set",
    shortName: "Acrylic extensions",
    description:
      "A new shape, a little length, a fresh perspective. A set designed around your style.",
    price: 55,
    duration: 90,
    note: "SHAPE YOUR OWN STYLE",
  },
  {
    id: "nail-art",
    name: "The creative detail",
    shortName: "Nail art",
    description:
      "Tiny canvases, endless possibilities. Personal details, playful accents, and artful finishing touches.",
    price: 15,
    duration: 25,
    note: "MAKE IT PERSONAL · ADD-ON",
  },
];

export const photos = [
  {
    id: "soft-statement",
    image: "photo-1604654894610-df63bc536371",
    title: "A soft statement",
    category: "gel",
    alt: "Black manicure with tortoiseshell accent nails and a gray knit sleeve",
    position: "center",
  },
  {
    id: "little-details",
    image: "photo-1519014816548-bf5fe059798b",
    title: "A little love note",
    category: "nail-art",
    alt: "Red nail art with heart-shaped tips and white love lettering",
    position: "center",
  },
  {
    id: "modern-muse",
    image: "photo-1610992015732-2449b76344bc",
    title: "Modern muse",
    category: "acrylic",
    alt: "Soft pink almond-shaped nails resting on a white textured surface",
    position: "center",
  },
  {
    id: "less-is-more",
    image: "photo-1632345031435-8727f6897d53",
    title: "The care ritual",
    category: "classic",
    alt: "A nail technician applying polish during a manicure",
    position: "center",
  },
  {
    id: "gloss-edit",
    image: "photo-1604654894610-df63bc536371",
    title: "The gloss edit",
    category: "gel",
    alt: "Detail of glossy black nails and a tortoiseshell accent",
    position: "60% 70%",
  },
  {
    id: "artful-moment",
    image: "photo-1632345031435-8727f6897d53",
    title: "An artful moment",
    category: "nail-art",
    alt: "A detail crop of a manicure session",
    position: "70% 65%",
  },
];

export const categories = [
  { id: "all", label: "All inspiration" },
  { id: "acrylic", label: "Acrylic" },
  { id: "gel", label: "Gel" },
  { id: "nail-art", label: "Nail art" },
  { id: "classic", label: "Classic" },
];

export const exampleReviews = [
  {
    id: "example-1",
    name: "The everyday escape",
    rating: 5,
    comment:
      "A little time to slow down, choose a beautiful color, and leave feeling more like myself. Exactly the kind of ritual I love.",
    style: "Classic manicure",
    example: true,
  },
  {
    id: "example-2",
    name: "A detail worth noticing",
    rating: 5,
    comment:
      "Soft shades, thoughtful details, and a touch of something different. My inspiration for a set that goes with absolutely everything.",
    style: "Gel manicure",
    example: true,
  },
  {
    id: "example-3",
    name: "Room to be creative",
    rating: 4,
    comment:
      "I love the idea of bringing a mood board and turning it into something personal. A small canvas for a big bit of personality.",
    style: "Nail art",
    example: true,
  },
];

export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const demoTimes = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export function validateBooking(values, today = localDateString()) {
  const errors = {};
  if (values.name.trim().length < 2)
    errors.name = "Enter a name with at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!services.some((service) => service.id === values.service))
    errors.service = "Choose a service.";
  const parsedDate = new Date(`${values.date}T12:00:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.date) ||
    Number.isNaN(parsedDate.getTime()) ||
    localDateString(parsedDate) !== values.date
  ) {
    errors.date = "Choose a valid date.";
  } else if (values.date < today) {
    errors.date = "Choose today or a future date.";
  }
  if (!demoTimes.includes(values.time)) errors.time = "Choose an example time.";
  return errors;
}
