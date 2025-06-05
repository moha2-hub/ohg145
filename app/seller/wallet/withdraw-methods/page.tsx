"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/custom-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Types
export type WithdrawMethod = {
  id: string
  userId: string
  type: "binance" | "baridi mob" | "rajehi" | "vodafone cash" | "zine cash" | "paypal"
  destinationId: string
  label?: string
}

export default function WithdrawMethodsPage() {
  const [methods, setMethods] = useState<WithdrawMethod[]>([])
  const [type, setType] = useState("")
  const [destinationId, setDestinationId] = useState("")
  const [label, setLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch methods from backend
  useEffect(() => {
    fetch("/api/withdraw-methods")
      .then(async res => {
        if (!res.ok) return setMethods([])
        const text = await res.text()
        if (!text) return setMethods([])
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error("Invalid JSON response:", text)
          return setMethods([])
        }
        setMethods(data.methods)
      })
  }, [])

  // Validation helpers
  function validate() {
    if (!type) return "Please select a withdraw type."
    if (!destinationId) return "Please enter a destination ID."
    if (type === "paypal" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(destinationId)) return "Invalid PayPal email."
    if ((type === "binance" || type === "rajehi") && destinationId.length < 10) return "IBAN seems too short."
    if ((type === "baridi mob" || type === "vodafone cash" || type === "zine cash") && !/^\d{8,15}$/.test(destinationId)) return "Invalid mobile number."
    if (methods.some(m => m.type === type && m.destinationId === destinationId && m.id !== editId)) return "Duplicate method."
    return null
  }

  // Add or update method
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validate()
    if (error) {
      toast({ title: error, variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    if (editId) {
      const res = await fetch("/api/withdraw-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, type, destinationId, label })
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        toast({ title: "Error", description: "Invalid server response", variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      if (data.success) {
        setMethods(methods.map(m => m.id === editId ? { ...m, type, destinationId, label } : m))
        toast({ title: "Method updated" })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } else {
      const res = await fetch("/api/withdraw-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, destinationId, label })
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        toast({ title: "Error", description: "Invalid server response", variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      if (data.success) {
        fetch("/api/withdraw-methods")
          .then(async r => {
            if (!r.ok) return setMethods([])
            const t = await r.text()
            if (!t) return setMethods([])
            let d
            try {
              d = JSON.parse(t)
            } catch (e) {
              console.error("Invalid JSON response:", t)
              return setMethods([])
            }
            setMethods(d.methods)
          })
        toast({ title: "Method added" })
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    }
    setType("")
    setDestinationId("")
    setLabel("")
    setEditId(null)
    setIsSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this method?")) return
    const res = await fetch(`/api/withdraw-methods?id=${id}`, { method: "DELETE" })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      toast({ title: "Error", description: "Invalid server response", variant: "destructive" })
      return
    }
    if (data.success) {
      setMethods(methods.filter(m => m.id !== id))
      toast({ title: "Method deleted" })
    } else {
      toast({ title: "Error", description: data.message, variant: "destructive" })
    }
  }

  return (
    <DashboardLayout userRole="seller">
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Withdraw Methods</h1>
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Edit Method" : "Add New Method"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Withdraw Type</label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="baridi mob">Baridi Mob</SelectItem>
                    <SelectItem value="rajehi">Rajehi</SelectItem>
                    <SelectItem value="vodafone cash">Vodafone Cash</SelectItem>
                    <SelectItem value="zine cash">Zine Cash</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Destination ID</label>
                <Input
                  value={destinationId}
                  onChange={e => setDestinationId(e.target.value)}
                  placeholder={type === "paypal" ? "PayPal Email" : type === "binance" || type === "rajehi" ? "IBAN" : "Mobile Number"}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Label (optional)</label>
                <Input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. My PayPal, Main Account"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>{editId ? "Update" : "Add"}</Button>
                {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setType(""); setDestinationId(""); setLabel(""); }}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saved Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {methods.length === 0 ? (
              <p className="text-muted-foreground">No methods saved.</p>
            ) : (
              <ul className="space-y-2">
                {methods.map((m) => (
                  <li key={m.id} className="flex justify-between items-center border rounded p-3">
                    <div>
                      <div className="font-semibold">{m.label || m.type}</div>
                      <div className="text-xs text-muted-foreground">{m.type} – {m.destinationId}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(m)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>Delete</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
