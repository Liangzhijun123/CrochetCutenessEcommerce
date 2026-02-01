"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  User,
  Camera,
  Upload,
  Save,
  Eye,
  Star,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Palette,
  Award,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreatorProfile {
  id: string
  userId: string
  displayName: string
  bio: string
  location: string
  website: string
  socialLinks: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
  }
  profileImage?: string
  coverImage?: string
  brandColors: {
    primary: string
    secondary: string
  }
  specialties: string[]
  experience: string
  achievements: string[]
  isPublic: boolean
  allowMessages: boolean
  showLocation: boolean
  showSocialLinks: boolean
  stats: {
    totalSales: number
    totalRevenue: number
    averageRating: number
    totalReviews: number
    followers: number
    patternsPublished: number
  }
  createdAt: string
  updatedAt: string
}

interface CreatorProfileManagementProps {
  sellerId: string
}

const socialPlatforms = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/username' },
  { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: '@username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'youtube.com/channel/...' },
]

const specialtyOptions = [
  'Amigurumi', 'Baby Items', 'Blankets', 'Clothing', 'Home Decor', 
  'Accessories', 'Toys', 'Bags', 'Hats', 'Scarves', 'Sweaters', 'Shawls'
]

const experienceOptions = [
  'Beginner (0-2 years)',
  'Intermediate (3-5 years)',
  'Advanced (6-10 years)',
  'Expert (10+ years)'
]

export default function CreatorProfileManagement({ sellerId }: CreatorProfileManagementProps) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
    },
    brandColors: {
      primary: '#f43f5e',
      secondary: '#ec4899',
    },
    specialties: [] as string[],
    experience: '',
    achievements: [] as string[],
    isPublic: true,
    allowMessages: true,
    showLocation: true,
    showSocialLinks: true,
  })

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/seller/profile?sellerId=${sellerId}`)
      const result = await response.json()

      if (result.success) {
        setProfile(result.profile)
        if (result.profile) {
          setFormData({
            displayName: result.profile.displayName || '',
            bio: result.profile.bio || '',
            location: result.profile.location || '',
            website: result.profile.website || '',
            socialLinks: result.profile.socialLinks || {
              instagram: '',
              facebook: '',
              twitter: '',
              youtube: '',
            },
            brandColors: result.profile.brandColors || {
              primary: '#f43f5e',
              secondary: '#ec4899',
            },
            specialties: result.profile.specialties || [],
            experience: result.profile.experience || '',
            achievements: result.profile.achievements || [],
            isPublic: result.profile.isPublic ?? true,
            allowMessages: result.profile.allowMessages ?? true,
            showLocation: result.profile.showLocation ?? true,
            showSocialLinks: result.profile.showSocialLinks ?? true,
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch profile",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [sellerId])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setProfile(result.profile)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    try {
      setIsImageUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('sellerId', sellerId)

      const response = await fetch('/api/seller/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        if (profile) {
          const updatedProfile = {
            ...profile,
            [type === 'profile' ? 'profileImage' : 'coverImage']: result.imageUrl
          }
          setProfile(updatedProfile)
        }
        toast({
          title: "Success",
          description: `${type === 'profile' ? 'Profile' : 'Cover'} image updated successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsImageUploading(false)
    }
  }

  const handleSpecialtyToggle = (specialty: string) => {
    const updatedSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty]
    
    setFormData({ ...formData, specialties: updatedSpecialties })
  }

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, '']
    })
  }

  const updateAchievement = (index: number, value: string) => {
    const updatedAchievements = [...formData.achievements]
    updatedAchievements[index] = value
    setFormData({ ...formData, achievements: updatedAchievements })
  }

  const removeAchievement = (index: number) => {
    const updatedAchievements = formData.achievements.filter((_, i) => i !== index)
    setFormData({ ...formData, achievements: updatedAchievements })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Creator Profile</h2>
          <p className="text-muted-foreground">Manage your public creator profile and branding</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Stats */}
      {profile?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{profile.stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ${profile.stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {profile.stats.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.stats.totalReviews} reviews
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{profile.stats.followers}</div>
              <p className="text-xs text-muted-foreground">Followers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{profile.stats.patternsPublished}</div>
              <p className="text-xs text-muted-foreground">Patterns</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {profile.isPublic ? 'Public' : 'Private'}
              </div>
              <p className="text-xs text-muted-foreground">Profile Status</p>
            </CardContent>
          </Card>
        </div>
      )}

      {previewMode ? (
        <ProfilePreview profile={profile} formData={formData} />
      ) : (
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Images</CardTitle>
                <CardDescription>Upload your profile and cover images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.profileImage} />
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'profile')
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-medium">Profile Picture</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload a square image, at least 200x200px
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                    {profile?.coverImage ? (
                      <img
                        src={profile.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No cover image</p>
                      </div>
                    )}
                    <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'cover')
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a banner image, recommended size 1200x300px
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Your creator name"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell people about yourself and your crochet journey..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://your-website.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Choose colors that represent your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.brandColors.primary}
                        onChange={(e) => setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, primary: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.brandColors.primary}
                        onChange={(e) => setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, primary: e.target.value }
                        })}
                        placeholder="#f43f5e"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.brandColors.secondary}
                        onChange={(e) => setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, secondary: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.brandColors.secondary}
                        onChange={(e) => setFormData({
                          ...formData,
                          brandColors: { ...formData.brandColors, secondary: e.target.value }
                        })}
                        placeholder="#ec4899"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{
                  background: `linear-gradient(135deg, ${formData.brandColors.primary}20, ${formData.brandColors.secondary}20)`
                }}>
                  <h4 className="font-medium mb-2">Color Preview</h4>
                  <div className="flex space-x-2">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: formData.brandColors.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: formData.brandColors.secondary }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key}>
                    <Label htmlFor={key} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Label>
                    <Input
                      id={key}
                      value={formData.socialLinks[key as keyof typeof formData.socialLinks] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          [key]: e.target.value
                        }
                      })}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>What types of patterns do you create?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {specialtyOptions.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                        className="rounded"
                      />
                      <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience Level</CardTitle>
                <CardDescription>How long have you been crocheting?</CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select experience level</option>
                  {experienceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Highlight your accomplishments and awards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={achievement}
                      onChange={(e) => updateAchievement(index, e.target.value)}
                      placeholder="Describe your achievement..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAchievement(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addAchievement}>
                  <Award className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to all users
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let customers message you directly
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowMessages}
                    onCheckedChange={(checked) => setFormData({ ...formData, allowMessages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your location on your profile
                    </p>
                  </div>
                  <Switch
                    checked={formData.showLocation}
                    onCheckedChange={(checked) => setFormData({ ...formData, showLocation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Social Links</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your social media links
                    </p>
                  </div>
                  <Switch
                    checked={formData.showSocialLinks}
                    onCheckedChange={(checked) => setFormData({ ...formData, showSocialLinks: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

interface ProfilePreviewProps {
  profile: CreatorProfile | null
  formData: any
}

function ProfilePreview({ profile, formData }: ProfilePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Preview</CardTitle>
        <CardDescription>This is how your profile will appear to customers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cover Image */}
          {profile?.coverImage && (
            <div className="h-32 bg-muted rounded-lg overflow-hidden">
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Profile Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.profileImage} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{formData.displayName || 'Your Name'}</h3>
              {formData.showLocation && formData.location && (
                <p className="text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formData.location}
                </p>
              )}
              <p className="mt-2">{formData.bio || 'Your bio will appear here...'}</p>
              
              {/* Specialties */}
              {formData.specialties.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {formData.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {formData.showSocialLinks && (
                <div className="flex space-x-2 mt-3">
                  {Object.entries(formData.socialLinks).map(([platform, url]) => {
                    if (!url) return null
                    const platformConfig = socialPlatforms.find(p => p.key === platform)
                    if (!platformConfig) return null
                    const Icon = platformConfig.icon
                    return (
                      <Button key={platform} variant="outline" size="sm">
                        <Icon className="h-4 w-4" />
                      </Button>
                    )
                  })}
                  {formData.website && (
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {profile?.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.stats.totalSales}</div>
                <div className="text-sm text-muted-foreground">Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {profile.stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.stats.followers}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.stats.patternsPublished}</div>
                <div className="text-sm text-muted-foreground">Patterns</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}