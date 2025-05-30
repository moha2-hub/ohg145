"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/custom-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct } from "@/app/actions/products"

const categories = ["bots", "resources", "recharge", "events", "sira"]

export default function AddProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: null as File | null,
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm({ ...form, image: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.price || !form.category || !form.image) {
      alert("Please fill all fields.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("price", form.price)
      formData.append("productType", form.category)  // <-- IMPORTANT: match server key
      formData.append("image", form.image)

      const result = await createProduct(formData)

      if (result?.success) {
        router.push("/admin/products")
      } else {
        alert("Failed to create product.")
      }
    } catch (error) {
      alert("An unexpected error occurred.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 mt-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="price">Price (in points)</Label>
          <Input name="price" value={form.price} onChange={handleChange} type="number" required />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            onValueChange={(val) => setForm({ ...form, category: val })}
            value={form.category}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="image">Product Image</Label>
          <Input type="file" accept="image/*" onChange={handleFileChange} required />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </DashboardLayout>
  )
}
