"use server"

import { query } from "@/lib/db"
import type { Transaction } from "@/types/database"
import { getCurrentUser } from "./auth"

export async function getTransactionsByUserId(): Promise<Transaction[]> {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  return await query<Transaction>("SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC", [user.id])
}

export async function verifyTopUp(transactionId: number, approved: boolean) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return { success: false, message: "Unauthorized" }
  }

  try {
    await query("BEGIN")

    // Get the transaction details
    const transactions = await query(
      "SELECT * FROM transactions WHERE id = $1 AND type = 'top_up' AND status = 'pending' LIMIT 1",
      [transactionId],
    )

    if (transactions.length === 0) {
      await query("ROLLBACK")
      return { success: false, message: "Transaction not found or already processed" }
    }

    const transaction = transactions[0]
    const newStatus = approved ? "completed" : "rejected"

    // Update transaction status
    await query("UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      newStatus,
      transactionId,
    ])

    // If approved, add points to user's account
    if (approved) {
      await query("UPDATE users SET points = points + $1 WHERE id = $2", [transaction.amount, transaction.user_id])
    }

    // Create notification for the user
    await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id)
       VALUES ($1, $2, $3, 'payment', $4)`,
      [
        transaction.user_id,
        approved ? "Top-up Approved" : "Top-up Rejected",
        approved
          ? `Your top-up request for ${transaction.amount} points has been approved.`
          : `Your top-up request for ${transaction.amount} points has been rejected.`,
        transactionId,
      ],
    )

    await query("COMMIT")
    return { success: true }
  } catch (error) {
    await query("ROLLBACK")
    console.error("Verify top-up error:", error)
    return { success: false, message: "Failed to process top-up request" }
  }
}

export async function requestTopUp(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== "customer") {
    return { success: false, message: "Only customers can request top-ups" }
  }

  const amount = Number.parseInt(formData.get("amount") as string)
  const paymentMethod = formData.get("paymentMethod") as string
  const notes = formData.get("notes") as string
  const receiptUrl = formData.get("receiptUrl") as string

  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Invalid amount" }
  }

  if (!paymentMethod) {
    return { success: false, message: "Payment method is required" }
  }

  if (!receiptUrl) {
    return { success: false, message: "Receipt is required" }
  }

  try {
    const result = await query(
      `INSERT INTO transactions (user_id, type, amount, status, payment_method, receipt_url, notes)
       VALUES ($1, 'top_up', $2, 'pending', $3, $4, $5) RETURNING id`,
      [user.id, amount, paymentMethod, receiptUrl, notes],
    )

    const transactionId = result[0].id

    // Notify admins about the new top-up request
    await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id)
       SELECT id, 'New Top-up Request', 'A new point top-up request needs verification', 'payment', $1
       FROM users WHERE role = 'admin'`,
      [transactionId],
    )

    return { success: true, transactionId }
  } catch (error) {
    console.error("Request top-up error:", error)
    return { success: false, message: "Failed to submit top-up request" }
  }
}
