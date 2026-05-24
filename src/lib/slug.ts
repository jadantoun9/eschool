import { customAlphabet } from "nanoid";

// URL-safe, unambiguous alphabet (no 0/O/1/I/l)
const nano = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

export const newSlug = () => nano();
