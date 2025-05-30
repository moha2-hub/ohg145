"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProductById, updateProduct } from "@/app/actions/products"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardLayout } from "@/components/custom-dashboard-layout"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      const data = await getProductById(id)
      setProduct(data)
    }

    loadProduct()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateProduct(id, product)
      router.push("/admin/products")
    } catch (error) {
      console.error("Failed to update product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!product) return <div className="p-6">Loading...</div>

  return (
    <DashboardLayout userRole="admin">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>

        <div>
          <Label>Name</Label>
          <Input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
        </div>

        <div>
          <Label>Price</Label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} />
        </div>

        <div className="flex items-center justify-between">
          <Label>Status (Active)</Label>
          <Switch
            checked={product.active}
            onCheckedChange={(val) => setProduct({ ...product, active: val })}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Product"}
        </Button>
      </form>
    </DashboardLayout>
  )
}
