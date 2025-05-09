"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Youtube, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

const creatorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  channelUrl: z
    .string()
    .url("Please enter a valid URL")
    .includes("youtube.com", { message: "Please enter a valid YouTube channel URL" }),
  subscriberCount: z.string().min(1, "Please enter your subscriber count"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio cannot exceed 500 characters"),
  socialMedia: z.string().optional(),
  message: z.string().max(1000, "Message cannot exceed 1000 characters").optional(),
})

type CreatorFormValues = z.infer<typeof creatorFormSchema>

export default function CreatorApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      channelUrl: "",
      subscriberCount: "",
      bio: "",
      socialMedia: "",
      message: "",
    },
  })

  function onSubmit(data: CreatorFormValues) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      })
      form.reset()
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="channelUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube Channel URL</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="https://youtube.com/c/yourchannel" {...field} />
                  <Youtube className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormDescription>Please provide the full URL to your YouTube channel</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subscriberCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscriber Count</FormLabel>
              <FormControl>
                <Input placeholder="10,000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creator Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself and your crochet journey..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>This will be displayed on your creator profile page</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialMedia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Social Media Links</FormLabel>
              <FormControl>
                <Input placeholder="Instagram, TikTok, etc. (comma separated)" {...field} />
              </FormControl>
              <FormDescription>Optional: Share your other social media accounts</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea placeholder="Anything else you'd like us to know..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Apply to Become a Creator <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
