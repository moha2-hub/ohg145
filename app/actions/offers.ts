"use server"

import { query } from "@/lib/db"

export async function getOffers() {
  return await query(`SELECT id, title, description FROM offers WHERE active = true`)
}
