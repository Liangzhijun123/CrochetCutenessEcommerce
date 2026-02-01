"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, Coins, Star, Trophy, DollarSign, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SystemConfig {
  coins: {
    dailyClaimAmount: number
    streakBonusEnabled: boolean
    streakBonusAmount: number
    streakBonusThreshold: number
    purchaseBonusEnabled: boolean
    purchaseBonusRate: number
  }
  points: {
    purchasePointsRate: number
    tierThresholds: {
      bronze: number
      silver: number
      gold: number
      platinum: number
    }
    tierBenefits: {
      bronze: { discount: number }
      silver: { discount: number }
      gold: { discount: number }
      platinum: { discount: number }
    }
  }
  competitions: {
    maxEntriesPerUser: number
    votingEnabled: boolean
    autoSelectWinner: boolean
    entryFee: number
    minPrizeValue: number
  }
  platform: {
    commissionRate: number
    minPatternPrice: number
    maxPatternPrice: number
    maintenanceMode: boolean
    registrationEnabled: boolean
    sellerApplicationsEnabled: boolean
  }
}

export default function SystemConfiguration() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/config", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      } else {
        toast({
          title: "Error",
          description: "Failed to load system configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch config:", error)
      toast({
        title: "Error",
        description: "Failed to load system configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [key]: value,
      },
    })
    setHasChanges(true)
  }

  const updateNestedConfig = (section: keyof SystemConfig, parent: string, key: string, value: any) => {
    if (!config) return
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [parent]: {
          ...(config[section] as any)[parent],
          [key]: value,
        },
      },
    })
    setHasChanges(true)
  }

  const saveConfig = async () => {
    if (!config) return

    try {
      setSaving(true)
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "System configuration saved successfully",
        })
        setHasChanges(false)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to save configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load configuration</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Configuration</h2>
          <p className="text-muted-foreground">
            Configure platform settings and parameters
          </p>
        </div>
        <Button 
          onClick={saveConfig} 
          disabled={!hasChanges || saving}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      <Tabs defaultValue="coins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coins">
            <Coins className="h-4 w-4 mr-2" />
            Coins
          </TabsTrigger>
          <TabsTrigger value="points">
            <Star className="h-4 w-4 mr-2" />
            Points
          </TabsTrigger>
          <TabsTrigger value="competitions">
            <Trophy className="h-4 w-4 mr-2" />
            Competitions
          </TabsTrigger>
          <TabsTrigger value="platform">
            <Settings className="h-4 w-4 mr-2" />
            Platform
          </TabsTrigger>
        </TabsList>

        {/* Coins Configuration */}
        <TabsContent value="coins">
          <Card>
            <CardHeader>
              <CardTitle>Coin System Configuration</CardTitle>
              <CardDescription>Configure daily coins and bonus rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dailyClaimAmount">Daily Claim Amount</Label>
                <Input
                  id="dailyClaimAmount"
                  type="number"
                  value={config.coins.dailyClaimAmount}
                  onChange={(e) => updateConfig("coins", "dailyClaimAmount", parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Number of coins users receive for daily check-in
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Streak Bonus</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable bonus coins for login streaks
                    </p>
                  </div>
                  <Switch
                    checked={config.coins.streakBonusEnabled}
                    onCheckedChange={(checked) => updateConfig("coins", "streakBonusEnabled", checked)}
                  />
                </div>

                {config.coins.streakBonusEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="streakBonusAmount">Streak Bonus Amount</Label>
                      <Input
                        id="streakBonusAmount"
                        type="number"
                        value={config.coins.streakBonusAmount}
                        onChange={(e) => updateConfig("coins", "streakBonusAmount", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="streakBonusThreshold">Streak Threshold (days)</Label>
                      <Input
                        id="streakBonusThreshold"
                        type="number"
                        value={config.coins.streakBonusThreshold}
                        onChange={(e) => updateConfig("coins", "streakBonusThreshold", parseInt(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Minimum streak days required for bonus
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Purchase Bonus</Label>
                    <p className="text-sm text-muted-foreground">
                      Award coins for purchases
                    </p>
                  </div>
                  <Switch
                    checked={config.coins.purchaseBonusEnabled}
                    onCheckedChange={(checked) => updateConfig("coins", "purchaseBonusEnabled", checked)}
                  />
                </div>

                {config.coins.purchaseBonusEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="purchaseBonusRate">Purchase Bonus Rate (%)</Label>
                    <Input
                      id="purchaseBonusRate"
                      type="number"
                      step="0.1"
                      value={config.coins.purchaseBonusRate}
                      onChange={(e) => updateConfig("coins", "purchaseBonusRate", parseFloat(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Percentage of purchase amount awarded as coins
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Configuration */}
        <TabsContent value="points">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Points System Configuration</CardTitle>
                <CardDescription>Configure loyalty points and tier system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="purchasePointsRate">Purchase Points Rate</Label>
                  <Input
                    id="purchasePointsRate"
                    type="number"
                    step="0.1"
                    value={config.points.purchasePointsRate}
                    onChange={(e) => updateConfig("points", "purchasePointsRate", parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Points earned per dollar spent
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loyalty Tier Thresholds</CardTitle>
                <CardDescription>Points required for each tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bronzeThreshold">Bronze Tier</Label>
                    <Input
                      id="bronzeThreshold"
                      type="number"
                      value={config.points.tierThresholds.bronze}
                      onChange={(e) => updateNestedConfig("points", "tierThresholds", "bronze", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="silverThreshold">Silver Tier</Label>
                    <Input
                      id="silverThreshold"
                      type="number"
                      value={config.points.tierThresholds.silver}
                      onChange={(e) => updateNestedConfig("points", "tierThresholds", "silver", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goldThreshold">Gold Tier</Label>
                    <Input
                      id="goldThreshold"
                      type="number"
                      value={config.points.tierThresholds.gold}
                      onChange={(e) => updateNestedConfig("points", "tierThresholds", "gold", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platinumThreshold">Platinum Tier</Label>
                    <Input
                      id="platinumThreshold"
                      type="number"
                      value={config.points.tierThresholds.platinum}
                      onChange={(e) => updateNestedConfig("points", "tierThresholds", "platinum", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Benefits</CardTitle>
                <CardDescription>Discount percentages for each tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bronzeDiscount">Bronze Discount (%)</Label>
                    <Input
                      id="bronzeDiscount"
                      type="number"
                      step="0.1"
                      value={config.points.tierBenefits.bronze.discount}
                      onChange={(e) => updateNestedConfig("points", "tierBenefits", "bronze", { discount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="silverDiscount">Silver Discount (%)</Label>
                    <Input
                      id="silverDiscount"
                      type="number"
                      step="0.1"
                      value={config.points.tierBenefits.silver.discount}
                      onChange={(e) => updateNestedConfig("points", "tierBenefits", "silver", { discount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goldDiscount">Gold Discount (%)</Label>
                    <Input
                      id="goldDiscount"
                      type="number"
                      step="0.1"
                      value={config.points.tierBenefits.gold.discount}
                      onChange={(e) => updateNestedConfig("points", "tierBenefits", "gold", { discount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platinumDiscount">Platinum Discount (%)</Label>
                    <Input
                      id="platinumDiscount"
                      type="number"
                      step="0.1"
                      value={config.points.tierBenefits.platinum.discount}
                      onChange={(e) => updateNestedConfig("points", "tierBenefits", "platinum", { discount: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competitions Configuration */}
        <TabsContent value="competitions">
          <Card>
            <CardHeader>
              <CardTitle>Competition System Configuration</CardTitle>
              <CardDescription>Configure competition rules and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxEntriesPerUser">Max Entries Per User</Label>
                <Input
                  id="maxEntriesPerUser"
                  type="number"
                  value={config.competitions.maxEntriesPerUser}
                  onChange={(e) => updateConfig("competitions", "maxEntriesPerUser", parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of entries a user can submit per competition
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Community Voting</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to vote on competition entries
                  </p>
                </div>
                <Switch
                  checked={config.competitions.votingEnabled}
                  onCheckedChange={(checked) => updateConfig("competitions", "votingEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Select Winner</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically select winner based on votes
                  </p>
                </div>
                <Switch
                  checked={config.competitions.autoSelectWinner}
                  onCheckedChange={(checked) => updateConfig("competitions", "autoSelectWinner", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="entryFee">Entry Fee (coins)</Label>
                <Input
                  id="entryFee"
                  type="number"
                  value={config.competitions.entryFee}
                  onChange={(e) => updateConfig("competitions", "entryFee", parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Coin cost to enter a competition (0 for free)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrizeValue">Minimum Prize Value ($)</Label>
                <Input
                  id="minPrizeValue"
                  type="number"
                  value={config.competitions.minPrizeValue}
                  onChange={(e) => updateConfig("competitions", "minPrizeValue", parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum prize value required for competitions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Configuration */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>General platform settings and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Platform Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.1"
                  value={config.platform.commissionRate}
                  onChange={(e) => updateConfig("platform", "commissionRate", parseFloat(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Percentage of each sale taken as platform fee
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPatternPrice">Min Pattern Price ($)</Label>
                  <Input
                    id="minPatternPrice"
                    type="number"
                    step="0.01"
                    value={config.platform.minPatternPrice}
                    onChange={(e) => updateConfig("platform", "minPatternPrice", parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPatternPrice">Max Pattern Price ($)</Label>
                  <Input
                    id="maxPatternPrice"
                    type="number"
                    step="0.01"
                    value={config.platform.maxPatternPrice}
                    onChange={(e) => updateConfig("platform", "maxPatternPrice", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable platform access for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={config.platform.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig("platform", "maintenanceMode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={config.platform.registrationEnabled}
                    onCheckedChange={(checked) => updateConfig("platform", "registrationEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Seller Applications</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept new seller applications
                    </p>
                  </div>
                  <Switch
                    checked={config.platform.sellerApplicationsEnabled}
                    onCheckedChange={(checked) => updateConfig("platform", "sellerApplicationsEnabled", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
