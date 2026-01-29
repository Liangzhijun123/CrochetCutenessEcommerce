"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, ExternalLink, User, Building, Calendar, Target, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SellerApplication = {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  experience: string
  businessName: string
  businessType: "individual" | "llc" | "corporation" | "partnership"
  yearsExperience: string
  specialties: string
  whyJoin: string
  portfolioUrl?: string
  expectedMonthlyListings: string
  socialMedia?: {
    instagram?: string
    pinterest?: string
    etsy?: string
    youtube?: string
  }
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  updatedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  adminFeedback?: string
}

interface SellerApplicationReviewProps {
  application: SellerApplication
  onApprove: (id: string, feedback?: string) => void
  onReject: (id: string, feedback: string) => void
  adminId?: string
}

export default function SellerApplicationReview({ 
  application, 
  onApprove, 
  onReject, 
  adminId 
}: SellerApplicationReviewProps) {
  const { toast } = useToast()
  const [feedback, setFeedback] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(application.id, feedback)
      toast({
        title: "Application Approved",
        description: `${application.name}'s seller application has been approved.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback when rejecting an application.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      await onReject(application.id, feedback)
      toast({
        title: "Application Rejected",
        description: `${application.name}'s seller application has been rejected.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case "individual": return "Individual/Sole Proprietor"
      case "llc": return "LLC"
      case "corporation": return "Corporation"
      case "partnership": return "Partnership"
      default: return type
    }
  }

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case "less-than-1": return "Less than 1 year"
      case "1-2": return "1-2 years"
      case "3-5": return "3-5 years"
      case "6-10": return "6-10 years"
      case "more-than-10": return "More than 10 years"
      default: return exp
    }
  }

  const getListingsLabel = (listings: string) => {
    switch (listings) {
      case "1-5": return "1-5 patterns per month"
      case "6-10": return "6-10 patterns per month"
      case "11-20": return "11-20 patterns per month"
      case "more-than-20": return "More than 20 patterns per month"
      default: return listings
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-full">
              <User className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{application.name}</CardTitle>
              <CardDescription className="text-base">{application.email}</CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{application.businessName}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {application.status === "pending" ? "Pending Review" : application.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Submitted: {new Date(application.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Business Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
              <p className="text-sm">{getBusinessTypeLabel(application.businessType)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Years of Experience</Label>
              <p className="text-sm">{getExperienceLabel(application.yearsExperience)}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-muted-foreground">Expected Monthly Listings</Label>
              <p className="text-sm">{getListingsLabel(application.expectedMonthlyListings)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            About the Applicant
          </h3>
          <div className="space-y-4 pl-7">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
              <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{application.bio}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Specialties</Label>
              <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{application.specialties}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Selling Experience</Label>
              <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{application.experience}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Why Join Our Platform</Label>
              <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{application.whyJoin}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Online Presence */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Online Presence
          </h3>
          <div className="space-y-2 pl-7">
            {application.portfolioUrl && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground w-20">Portfolio:</Label>
                <a 
                  href={application.portfolioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {application.portfolioUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {application.socialMedia?.instagram && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground w-20">Instagram:</Label>
                <a 
                  href={application.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {application.socialMedia.instagram}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {application.socialMedia?.pinterest && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground w-20">Pinterest:</Label>
                <a 
                  href={application.socialMedia.pinterest} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {application.socialMedia.pinterest}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {application.socialMedia?.youtube && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground w-20">YouTube:</Label>
                <a 
                  href={application.socialMedia.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {application.socialMedia.youtube}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {application.socialMedia?.etsy && (
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground w-20">Etsy:</Label>
                <a 
                  href={application.socialMedia.etsy} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {application.socialMedia.etsy}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {!application.portfolioUrl && !application.socialMedia?.instagram && 
             !application.socialMedia?.pinterest && !application.socialMedia?.youtube && 
             !application.socialMedia?.etsy && (
              <p className="text-sm text-muted-foreground">No online presence provided</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Admin Feedback Section */}
        <div className="space-y-3">
          <Label htmlFor="feedback" className="text-sm font-medium">
            Admin Feedback {application.status === "pending" && "(Optional for approval, required for rejection)"}
          </Label>
          <Textarea
            id="feedback"
            placeholder="Provide feedback for the applicant..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>

      {application.status === "pending" && (
        <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={handleReject} 
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Application
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Application
          </Button>
        </CardFooter>
      )}

      {application.status !== "pending" && application.adminFeedback && (
        <CardFooter>
          <div className="w-full space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Admin Feedback</Label>
            <p className="text-sm p-3 bg-muted/50 rounded-md">{application.adminFeedback}</p>
            {application.reviewedAt && (
              <p className="text-xs text-muted-foreground">
                Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}