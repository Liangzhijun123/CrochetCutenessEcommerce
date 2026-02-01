"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Shield, 
  Star,
  Award,
  Camera,
  Link as LinkIcon
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

type VerificationLevel = "basic" | "verified" | "premium"

type VerificationRequirement = {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  level: VerificationLevel
  icon: React.ReactNode
}

export default function SellerVerificationSystem() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

  const currentLevel = user?.sellerProfile?.verificationLevel || "basic"

  const requirements: VerificationRequirement[] = [
    {
      id: "profile_complete",
      title: "Complete Profile",
      description: "Fill out all required profile information",
      completed: true, // Assume completed since they're a seller
      required: true,
      level: "basic",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      id: "bank_account",
      title: "Bank Account Verified",
      description: "Add and verify your bank account information",
      completed: !!user?.sellerProfile?.bankInfo,
      required: true,
      level: "basic",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      id: "identity_document",
      title: "Identity Verification",
      description: "Upload a government-issued ID for identity verification",
      completed: false,
      required: true,
      level: "verified",
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: "business_license",
      title: "Business License",
      description: "Upload business license or registration documents",
      completed: false,
      required: false,
      level: "verified",
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: "portfolio_review",
      title: "Portfolio Review",
      description: "Submit portfolio of your work for quality assessment",
      completed: false,
      required: true,
      level: "verified",
      icon: <Camera className="h-5 w-5" />
    },
    {
      id: "social_media_verification",
      title: "Social Media Verification",
      description: "Verify your social media accounts and online presence",
      completed: !!user?.sellerProfile?.socialMedia,
      required: false,
      level: "verified",
      icon: <LinkIcon className="h-5 w-5" />
    },
    {
      id: "sales_history",
      title: "Sales History",
      description: "Maintain consistent sales and positive reviews",
      completed: (user?.sellerProfile?.salesCount || 0) >= 10,
      required: true,
      level: "premium",
      icon: <Star className="h-5 w-5" />
    },
    {
      id: "customer_rating",
      title: "High Customer Rating",
      description: "Maintain a 4.5+ star average rating",
      completed: (user?.sellerProfile?.rating || 0) >= 4.5,
      required: true,
      level: "premium",
      icon: <Award className="h-5 w-5" />
    }
  ]

  const getVerificationBadge = (level: VerificationLevel) => {
    switch (level) {
      case "basic":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Basic
          </Badge>
        )
      case "verified":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )
      case "premium":
        return (
          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
            <Award className="h-3 w-3" />
            Premium
          </Badge>
        )
    }
  }

  const getLevelRequirements = (level: VerificationLevel) => {
    return requirements.filter(req => req.level === level)
  }

  const getLevelProgress = (level: VerificationLevel) => {
    const levelReqs = getLevelRequirements(level)
    const completed = levelReqs.filter(req => req.completed).length
    return (completed / levelReqs.length) * 100
  }

  const canUpgradeToLevel = (level: VerificationLevel) => {
    const levelReqs = getLevelRequirements(level).filter(req => req.required)
    return levelReqs.every(req => req.completed)
  }

  const handleFileUpload = (requirementId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [requirementId]: file }))
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded for review.`,
    })
  }

  const handleSubmitVerification = async (level: VerificationLevel) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call to submit verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Verification Submitted",
        description: `Your ${level} verification has been submitted for review. You'll receive an email notification once it's processed.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLevelBenefits = (level: VerificationLevel) => {
    switch (level) {
      case "basic":
        return [
          "List products on the platform",
          "Access to basic seller tools",
          "Standard commission rates"
        ]
      case "verified":
        return [
          "Verified badge on your profile",
          "Higher search ranking",
          "Access to premium features",
          "Priority customer support",
          "Reduced commission rates (12%)"
        ]
      case "premium":
        return [
          "Premium badge and featured listings",
          "Lowest commission rates (10%)",
          "Advanced analytics and insights",
          "Early access to new features",
          "Dedicated account manager",
          "Marketing support and promotion"
        ]
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Seller Verification</h2>
        <p className="text-muted-foreground mb-4">
          Increase your credibility and unlock premium features by completing verification levels
        </p>
        <div className="flex justify-center">
          {getVerificationBadge(currentLevel)}
        </div>
      </div>

      {/* Current Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Verification Level: {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
          </CardTitle>
          <CardDescription>
            Your current verification status and benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {getLevelBenefits(currentLevel).map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <div className="grid gap-6">
        {(["basic", "verified", "premium"] as VerificationLevel[]).map((level) => {
          const levelReqs = getLevelRequirements(level)
          const progress = getLevelProgress(level)
          const canUpgrade = canUpgradeToLevel(level)
          const isCurrentLevel = currentLevel === level
          const isUnlocked = currentLevel === "premium" || 
                           (currentLevel === "verified" && level !== "premium") ||
                           (currentLevel === "basic" && level === "basic")

          return (
            <Card key={level} className={isCurrentLevel ? "border-blue-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      level === "basic" ? "bg-gray-100" :
                      level === "verified" ? "bg-blue-100" : "bg-purple-100"
                    }`}>
                      {level === "basic" ? <Shield className="h-5 w-5 text-gray-600" /> :
                       level === "verified" ? <CheckCircle className="h-5 w-5 text-blue-600" /> :
                       <Award className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div>
                      <CardTitle className="capitalize">{level} Verification</CardTitle>
                      <CardDescription>
                        {level === "basic" && "Essential verification for all sellers"}
                        {level === "verified" && "Enhanced credibility and features"}
                        {level === "premium" && "Maximum benefits and premium status"}
                      </CardDescription>
                    </div>
                  </div>
                  {getVerificationBadge(level)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium mb-3">Requirements:</h4>
                    <div className="space-y-3">
                      {levelReqs.map((req) => (
                        <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className={`mt-0.5 ${req.completed ? "text-green-600" : "text-gray-400"}`}>
                            {req.completed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">{req.title}</h5>
                              {req.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                            
                            {/* File upload for document requirements */}
                            {(req.id === "identity_document" || req.id === "business_license" || req.id === "portfolio_review") && !req.completed && (
                              <div className="mt-2">
                                <Input
                                  type="file"
                                  accept={req.id === "portfolio_review" ? "image/*" : ".pdf,.jpg,.jpeg,.png"}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload(req.id, file)
                                  }}
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {getLevelBenefits(level).map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {!isCurrentLevel && canUpgrade && (
                    <Button 
                      onClick={() => handleSubmitVerification(level)}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Submitting..." : `Apply for ${level.charAt(0).toUpperCase() + level.slice(1)} Verification`}
                    </Button>
                  )}
                  
                  {isCurrentLevel && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-green-800 font-medium">Current Level</p>
                    </div>
                  )}
                  
                  {!canUpgrade && !isCurrentLevel && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-sm text-gray-600">Complete required items to unlock</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}