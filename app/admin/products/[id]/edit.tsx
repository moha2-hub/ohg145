"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/custom-dashboard-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getProductById, updateProduct } from "@/app/actions/products-new" // or "@/app/actions/products" if you keep them there

export default function EditProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = Number(searchParams.get("id")) || null

  const [product, setProduct] = useState<null | {
    id: number
    name: string
    description: string
    price: number
    image_url?: string
    active: boolean
    category: string
    type: string
  }>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    active: true,
    category: "",
    type: "",
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!productId) return

    async function loadProduct() {
      const data = await getProductById(productId)
      if (data) {
        setProduct(data)
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          imageUrl: data.image_url || "",
          active: data.active,
          category: data.category,
          type: data.type,
        })
      }
    }
    loadProduct()
  }, [productId])

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError("")

    try {
      const data = new FormData()
      data.append("id", productId.toString())
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("price", formData.price)
      data.append("imageUrl", formData.imageUrl)
      data.append("active", formData.active.toString())
      data.append("category", formData.category)
      data.append("type", formData.type)

      const result = await updateProduct(data)
      if (result.success) {
        router.push("/admin/products")
      } else {
        setError(result.message || "Failed to update product")
      }
    } catch (e) {
      setError("Unexpected error")
    }
    setSaving(false)
  }

  if (!product) {
    return (
      <DashboardLayout userRole="admin">
        <p>Loading product...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h1>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="price">Price (points)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="active">Active</Label>
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleChange("active", e.target.checked)}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
