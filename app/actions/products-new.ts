"use server"

import { query } from "@/lib/db"

// Define an Offer type matching your DB schema
type Offer = {
  id: number
  product_id: number
  title: string
  description: string
  discount: number
  active: boolean
  created_at: string
  updated_at: string
}

// Get all offers for a given product
export async function getOffersByProduct(productId: number): Promise<Offer[]> {
  try {
    const offers = await query<Offer>(
      `SELECT * FROM offers WHERE product_id = $1 AND active = true ORDER BY created_at DESC`,
      [productId],
    )
    return offers || []
  } catch (error) {
    console.error("Get offers by product error:", error)
    return []
  }
}

// Create a new offer for a product
export async function createOffer(formData: FormData) {
  // You can add auth check similar to createProduct if needed

  const productId = Number.parseInt(formData.get("productId") as string)
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const discount = Number.parseFloat(formData.get("discount") as string)

  try {
    const result = await query<{ id: number }>(
      `INSERT INTO offers (product_id, title, description, discount, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
      [productId, title, description, discount],
    )
    return { success: true, offerId: result[0].id }
  } catch (error) {
    console.error("Create offer error:", error)
    return { success: false, message: "Failed to create offer" }
  }
}

// Get all products with their offers joined (optional example)
export async function getAllProductsWithOffers() {
  try {
    const productsWithOffers = await query(
      `SELECT p.*, o.id as offer_id, o.title as offer_title, o.discount as offer_discount
       FROM products p
       LEFT JOIN offers o ON o.product_id = p.id AND o.active = true
       ORDER BY p.name`,
    )
    return productsWithOffers || []
  } catch (error) {
    console.error("Get all products with offers error:", error)
    return []
  }
}
