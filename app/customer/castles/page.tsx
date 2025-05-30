"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/custom-dashboard-layout"
import { getCastlesByUserId, createCastle } from "@/app/actions/castles"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CastleIcon, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type CastleType = {
  id: number
  name: string
  igg_id: string
  castle_id: string
  login_credentials: string
  created_at: string
}

export default function CastlesPage() {
  const [castles, setCastles] = useState<CastleType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadCastles() {
      try {
        setIsLoading(true)
        const castlesData = await getCastlesByUserId()
        setCastles(castlesData)
      } catch (error) {
        console.error("Error loading castles:", error)
        toast({
          title: "Error",
          description: "Failed to load castles",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCastles()
  }, [toast])

  async function handleCreateCastle(formData: FormData) {
    setIsLoading(true)

    try {
      const result = await createCastle(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Castle added successfully",
        })

        // Reload castles to include the new one
        const castlesData = await getCastlesByUserId()
        setCastles(castlesData)
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add castle",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Create castle error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="customer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Castles</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Castle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Castle</DialogTitle>
                <DialogDescription>
                  Add your in-game castle details to receive services. Your login credentials are securely stored and
                  only shared with sellers when you place an order.
                </DialogDescription>
              </DialogHeader>

              <form action={handleCreateCastle} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Castle Name</Label>
                  <Input id="name" name="name" placeholder="My Main Castle" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iggId">IGG ID</Label>
                  <Input id="iggId" name="iggId" placeholder="123456789" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="castleId">Castle ID</Label>
                  <Input id="castleId" name="castleId" placeholder="C123456" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginCredentials">Login Credentials</Label>
                  <Textarea
                    id="loginCredentials"
                    name="loginCredentials"
                    placeholder="Username: example@email.com&#10;Password: yourpassword"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your credentials are encrypted and only shared with sellers when you place an order.
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Castle"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading castles...</p>
          </div>
        ) : castles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {castles.map((castle) => (
              <Card key={castle.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CastleIcon className="h-5 w-5" />
                    {castle.name}
                  </CardTitle>
                  <CardDescription>Added on {new Date(castle.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">IGG ID</p>
                      <p className="text-sm">{castle.igg_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Castle ID</p>
                      <p className="text-sm">{castle.castle_id}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Edit Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Castles Added</CardTitle>
              <CardDescription>
                You haven't added any castles yet. Add your first castle to start placing orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-6">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Castle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
