"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Building2, Shield, Check, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"

interface BankAccount {
  id: string
  type: "bank" | "paypal"
  accountName: string
  accountNumber?: string
  routingNumber?: string
  bankName?: string
  paypalEmail?: string
  isDefault: boolean
  isVerified: boolean
  country: string
  currency: string
  addedDate: string
}

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

// Helper component for displaying dates
function BankAccountDate({ date }: { date: string }) {
  const [dateStr, setDateStr] = useState("")
  useEffect(() => {
    setDateStr(new Date(date).toLocaleDateString())
  }, [date])
  return <span>Added on {dateStr || "..."}</span>
}

export default function BankAccountModal({ isOpen, onClose }: BankAccountModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("accounts")
  const [isEditing, setIsEditing] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  // Sample bank accounts data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      type: "bank",
      accountName: "John Doe",
      accountNumber: "****1234",
      routingNumber: "021000021",
      bankName: "Chase Bank",
      isDefault: true,
      isVerified: true,
      country: "United States",
      currency: "USD",
      addedDate: "2024-01-15",
    },
    {
      id: "2",
      type: "paypal",
      accountName: "John Doe",
      paypalEmail: "john.doe@email.com",
      isDefault: false,
      isVerified: false,
      country: "United States",
      currency: "USD",
      addedDate: "2024-01-20",
    },
  ])

  const [formData, setFormData] = useState({
    type: "bank" as "bank" | "paypal",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    paypalEmail: "",
    country: "United States",
    currency: "USD",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveAccount = () => {
    if (isEditing && editingAccount) {
      // Update existing account
      setBankAccounts((prev) =>
        prev.map((account) =>
          account.id === editingAccount.id ? { ...account, ...formData, isVerified: false } : account,
        ),
      )
      toast({
        title: "Account Updated",
        description: "Your bank account has been updated successfully. Verification may be required.",
      })
    } else {
      // Add new account
      const newAccount: BankAccount = {
        id: Math.floor(Math.random() * 1000000000).toString(),
        ...formData,
        isDefault: bankAccounts.length === 0,
        isVerified: false,
        addedDate: new Date().toISOString().split("T")[0],
      }
      setBankAccounts((prev) => [...prev, newAccount])
      toast({
        title: "Account Added",
        description: "Your bank account has been added successfully. Verification is required before withdrawals.",
      })
    }

    resetForm()
  }

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      type: account.type,
      accountName: account.accountName,
      accountNumber: account.accountNumber || "",
      routingNumber: account.routingNumber || "",
      bankName: account.bankName || "",
      paypalEmail: account.paypalEmail || "",
      country: account.country,
      currency: account.currency,
    })
    setIsEditing(true)
    setActiveTab("add")
  }

  const handleDeleteAccount = (accountId: string) => {
    setBankAccounts((prev) => prev.filter((account) => account.id !== accountId))
    toast({
      title: "Account Removed",
      description: "The bank account has been removed from your profile.",
    })
  }

  const handleSetDefault = (accountId: string) => {
    setBankAccounts((prev) =>
      prev.map((account) => ({
        ...account,
        isDefault: account.id === accountId,
      })),
    )
    toast({
      title: "Default Account Updated",
      description: "Your default withdrawal method has been updated.",
    })
  }

  const handleVerifyAccount = (accountId: string) => {
    setBankAccounts((prev) =>
      prev.map((account) => (account.id === accountId ? { ...account, isVerified: true } : account)),
    )
    toast({
      title: "Account Verified",
      description: "Your bank account has been verified successfully.",
    })
  }

  const resetForm = () => {
    setFormData({
      type: "bank",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      paypalEmail: "",
      country: "United States",
      currency: "USD",
    })
    setIsEditing(false)
    setEditingAccount(null)
    setActiveTab("accounts")
  }

  const isFormValid = () => {
    if (formData.type === "bank") {
      return formData.accountName && formData.accountNumber && formData.routingNumber && formData.bankName
    } else {
      return formData.accountName && formData.paypalEmail
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Management
          </DialogTitle>
          <DialogDescription>Manage your withdrawal methods and bank account information</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="add">{isEditing ? "Edit Account" : "Add Account"}</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Payment Methods</h3>
              <Button onClick={() => setActiveTab("add")} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Account
              </Button>
            </div>

            {bankAccounts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add a bank account or PayPal to start receiving withdrawals
                  </p>
                  <Button onClick={() => setActiveTab("add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <Card key={account.id} className={account.isDefault ? "border-green-200 bg-green-50/50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            {account.type === "bank" ? (
                              <Building2 className="h-5 w-5" />
                            ) : (
                              <CreditCard className="h-5 w-5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{account.accountName}</h4>
                              {account.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              )}
                              {account.isVerified ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Unverified
                                </Badge>
                              )}
                            </div>
                            {account.type === "bank" ? (
                              <div className="text-sm text-muted-foreground">
                                <p>{account.bankName}</p>
                                <p>Account: {account.accountNumber}</p>
                                <p>Routing: {account.routingNumber}</p>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                <p>PayPal Account</p>
                                <p>{account.paypalEmail}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              <BankAccountDate date={account.addedDate} />
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!account.isVerified && (
                            <Button variant="outline" size="sm" onClick={() => handleVerifyAccount(account.id)}>
                              <Shield className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          {!account.isDefault && account.isVerified && (
                            <Button variant="outline" size="sm" onClick={() => handleSetDefault(account.id)}>
                              Set Default
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleEditAccount(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            disabled={account.isDefault}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{isEditing ? "Edit Payment Method" : "Add New Payment Method"}</h3>
              {isEditing && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Type</CardTitle>
                <CardDescription>Choose your preferred withdrawal method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-colors ${
                      formData.type === "bank" ? "border-blue-500 bg-blue-50" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleInputChange("type", "bank")}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Building2 className="h-6 w-6" />
                      <div>
                        <h4 className="font-medium">Bank Account</h4>
                        <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      formData.type === "paypal" ? "border-blue-500 bg-blue-50" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleInputChange("type", "paypal")}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <h4 className="font-medium">PayPal</h4>
                        <p className="text-sm text-muted-foreground">PayPal account</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  {formData.type === "bank"
                    ? "Enter your bank account information"
                    : "Enter your PayPal account information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) => handleInputChange("accountName", e.target.value)}
                      placeholder="Full name on account"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.type === "bank" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => handleInputChange("bankName", e.target.value)}
                          placeholder="e.g., Chase Bank"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleInputChange("currency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                          placeholder="Account number"
                          type="password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          value={formData.routingNumber}
                          onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                          placeholder="9-digit routing number"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={formData.paypalEmail}
                      onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Security Notice</p>
                      <p className="text-blue-700">
                        Your banking information is encrypted and securely stored. We never store your full account
                        details.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveAccount} disabled={!isFormValid()}>
                {isEditing ? "Update Account" : "Add Account"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
