"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowRight, ArrowLeft, Store, CreditCard, FileText, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type OnboardingStep = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export default function SellerOnboardingFlow() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [storeProfile, setStoreProfile] = useState({
    storeName: user?.sellerProfile?.storeDescription || "",
    storeDescription: user?.sellerProfile?.bio || "",
    storeSlogan: "",
    specialties: "",
    targetAudience: "",
  })

  const [bankingInfo, setBankingInfo] = useState({
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    accountType: "checking",
  })

  const [agreementAccepted, setAgreementAccepted] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Selling!",
      description: "Let's get your seller account set up",
      icon: <Sparkles className="h-6 w-6" />,
      completed: false,
    },
    {
      id: "store-profile",
      title: "Store Profile",
      description: "Set up your store information",
      icon: <Store className="h-6 w-6" />,
      completed: false,
    },
    {
      id: "banking",
      title: "Payment Information",
      description: "Add your banking details for payments",
      icon: <CreditCard className="h-6 w-6" />,
      completed: false,
    },
    {
      id: "agreements",
      title: "Terms & Agreements",
      description: "Review and accept seller terms",
      icon: <FileText className="h-6 w-6" />,
      completed: false,
    },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStoreProfileChange = (field: string, value: string) => {
    setStoreProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleBankingInfoChange = (field: string, value: string) => {
    setBankingInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare onboarding data
      const onboardingData = {
        storeDescription: storeProfile.storeDescription,
        storeName: storeProfile.storeName,
        storeSlogan: storeProfile.storeSlogan,
        specialties: storeProfile.specialties,
        targetAudience: storeProfile.targetAudience,
        bankInfo: {
          accountName: bankingInfo.accountHolderName,
          accountNumber: bankingInfo.accountNumber,
          bankName: bankingInfo.bankName,
          routingNumber: bankingInfo.routingNumber,
          accountType: bankingInfo.accountType,
        },
      }

      // Call API to complete onboarding
      const response = await fetch("/api/seller/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          onboardingData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete onboarding")
      }

      const result = await response.json()

      // Update local user context
      if (user && updateUser) {
        updateUser(result.user)
      }

      toast({
        title: "Onboarding Complete!",
        description: "Welcome to selling on our platform! You can now start listing your patterns.",
      })

      // Redirect to seller dashboard
      router.push("/seller-dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-rose-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Congratulations, {user?.name}!</h2>
              <p className="text-muted-foreground mb-4">
                Your seller application has been approved. Let's get your store set up so you can start selling your amazing crochet patterns.
              </p>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Seller Approved
              </Badge>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set up your store profile</li>
                <li>• Add your payment information</li>
                <li>• Review seller agreements</li>
                <li>• Start listing your patterns!</li>
              </ul>
            </div>
          </div>
        )

      case 1: // Store Profile
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Store className="h-12 w-12 text-rose-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Set Up Your Store</h2>
              <p className="text-muted-foreground">Tell customers about your crochet business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  placeholder="Your Store Name"
                  value={storeProfile.storeName}
                  onChange={(e) => handleStoreProfileChange("storeName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="storeSlogan">Store Slogan (Optional)</Label>
                <Input
                  id="storeSlogan"
                  placeholder="A catchy tagline for your store"
                  value={storeProfile.storeSlogan}
                  onChange={(e) => handleStoreProfileChange("storeSlogan", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  placeholder="Describe your store and what makes your patterns special..."
                  value={storeProfile.storeDescription}
                  onChange={(e) => handleStoreProfileChange("storeDescription", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="specialties">Your Specialties</Label>
                <Textarea
                  id="specialties"
                  placeholder="What types of patterns do you create? (e.g., amigurumi, blankets, clothing)"
                  value={storeProfile.specialties}
                  onChange={(e) => handleStoreProfileChange("specialties", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="Who are your patterns for? (e.g., beginners, advanced crocheters, parents)"
                  value={storeProfile.targetAudience}
                  onChange={(e) => handleStoreProfileChange("targetAudience", e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 2: // Banking
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-rose-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Payment Information</h2>
              <p className="text-muted-foreground">Add your banking details to receive payments</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Secure:</strong> Your banking information is encrypted and stored securely. 
                We use this information only to process your seller payments.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  placeholder="Full name on the account"
                  value={bankingInfo.accountHolderName}
                  onChange={(e) => handleBankingInfoChange("accountHolderName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="password"
                    placeholder="••••••••••"
                    value={bankingInfo.accountNumber}
                    onChange={(e) => handleBankingInfoChange("accountNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    placeholder="9-digit routing number"
                    value={bankingInfo.routingNumber}
                    onChange={(e) => handleBankingInfoChange("routingNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Your bank's name"
                    value={bankingInfo.bankName}
                    onChange={(e) => handleBankingInfoChange("bankName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    value={bankingInfo.accountType}
                    onChange={(e) => handleBankingInfoChange("accountType", e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 3: // Agreements
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-rose-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Terms & Agreements</h2>
              <p className="text-muted-foreground">Review and accept our seller terms</p>
            </div>

            <div className="border rounded-lg p-6 max-h-96 overflow-y-auto bg-muted/20">
              <h3 className="font-semibold mb-4">Seller Agreement</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium">1. Commission Structure</h4>
                  <p className="text-muted-foreground">
                    We charge a 15% commission on all sales. This covers payment processing, 
                    platform maintenance, and customer support.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">2. Payment Schedule</h4>
                  <p className="text-muted-foreground">
                    Payments are processed weekly on Fridays for sales made the previous week. 
                    Funds typically arrive in your account within 2-3 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">3. Content Guidelines</h4>
                  <p className="text-muted-foreground">
                    All patterns must be original work or properly licensed. Patterns should include 
                    clear instructions and high-quality images. We reserve the right to remove 
                    content that doesn't meet our quality standards.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">4. Customer Support</h4>
                  <p className="text-muted-foreground">
                    You're responsible for providing support to customers who purchase your patterns. 
                    This includes answering questions and helping with pattern issues.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">5. Account Termination</h4>
                  <p className="text-muted-foreground">
                    Either party may terminate this agreement with 30 days notice. Upon termination, 
                    you'll receive payment for any pending sales minus applicable fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agreement"
                checked={agreementAccepted}
                onChange={(e) => setAgreementAccepted(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="agreement" className="text-sm">
                I have read and agree to the Seller Agreement and Terms of Service. 
                I understand the commission structure and my responsibilities as a seller.
              </Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Seller Onboarding</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-full">
              {steps[currentStep].icon}
            </div>
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <div className="p-6 pt-0">
          <Separator className="mb-4" />
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleCompleteOnboarding}
                disabled={!agreementAccepted || isSubmitting}
              >
                {isSubmitting ? "Completing..." : "Complete Onboarding"}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}