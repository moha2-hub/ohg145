"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, ShoppingCart, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { query } from "@/lib/db"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    pendingOrders: 0,
    openReclamations: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)

        // Fetch stats
        const statsData = await query(`
          SELECT 
            (SELECT COUNT(*) FROM products) as products,
            (SELECT COUNT(*) FROM users) as users,
            (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
            (SELECT COUNT(*) FROM reclamations WHERE status = 'pending') as open_reclamations
        `)

        if (statsData.length > 0) {
          setStats({
            products: Number.parseInt(statsData[0].products) || 0,
            users: Number.parseInt(statsData[0].users) || 0,
            pendingOrders: Number.parseInt(statsData[0].pending_orders) || 0,
            openReclamations: Number.parseInt(statsData[0].open_reclamations) || 0,
          })
        }

        // Fetch recent activity
        const activityData = await query(`
          SELECT 
            'transaction' as type,
            id,
            user_id,
            created_at,
            type as transaction_type,
            amount
          FROM transactions
          WHERE status = 'pending' AND type = 'top_up'
          
          UNION ALL
          
          SELECT 
            'order' as type,
            id,
            customer_id as user_id,
            created_at,
            status,
            amount
          FROM orders
          WHERE created_at > NOW() - INTERVAL '24 hours'
          
          UNION ALL
          
          SELECT 
            'reclamation' as type,
            id,
            customer_id as user_id,
            created_at,
            status,
            NULL as amount
          FROM reclamations
          WHERE status = 'pending'
          
          ORDER BY created_at DESC
          LIMIT 5
        `)

        setRecentActivity(activityData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.products}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reclamations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.openReclamations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">Loading activity...</div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                    {item.type === "transaction" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : item.type === "order" ? (
                      <ShoppingCart className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {item.type === "transaction"
                        ? "New point top-up request"
                        : item.type === "order"
                          ? "New order placed"
                          : "New reclamation filed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.type === "transaction"
                        ? `User ID ${item.user_id} requested ${item.amount} points`
                        : item.type === "order"
                          ? `Order #${item.id} was placed`
                          : `Reclamation #${item.id} was filed`}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">No recent activity</div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="top-ups">
            <TabsList className="mb-4">
              <TabsTrigger value="top-ups">Point Top-ups</TabsTrigger>
              <TabsTrigger value="reclamations">Reclamations</TabsTrigger>
              <TabsTrigger value="sellers">Seller Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="top-ups">
              <div className="py-6 text-center text-muted-foreground">
                Visit the Top-ups page to manage pending top-up requests
              </div>
            </TabsContent>

            <TabsContent value="reclamations">
              <div className="py-6 text-center text-muted-foreground">
                Visit the Reclamations page to manage pending complaints
              </div>
            </TabsContent>

            <TabsContent value="sellers">
              <div className="py-6 text-center text-muted-foreground">Visit the Users page to manage user roles</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
