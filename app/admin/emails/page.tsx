"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"
import { getAllSentEmails, clearSentEmails, type EmailData } from "@/lib/email-service"
import EmailTemplatePreview from "@/components/emails/email-template"
import { formatDate } from "@/lib/utils"

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailData[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = () => {
    const allEmails = getAllSentEmails()
    setEmails(allEmails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()))

    if (allEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(allEmails[0])
    }
  }

  const handleClearEmails = () => {
    if (confirm("Are you sure you want to clear all email records? This is for demo purposes only.")) {
      clearSentEmails()
      setEmails([])
      setSelectedEmail(null)
    }
  }

  const filteredEmails = emails.filter((email) => {
    if (activeTab === "all") return true
    if (activeTab === "order-confirmation") return email.template === "order-confirmation"
    if (activeTab === "order-processing") return email.template === "order-processing"
    if (activeTab === "order-shipped") return email.template === "order-shipped"
    if (activeTab === "order-delivered") return email.template === "order-delivered"
    if (activeTab === "order-cancelled") return email.template === "order-cancelled"
    return true
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Email Notifications</h1>
          <p className="text-muted-foreground">View all sent email notifications (demo only)</p>
        </div>
        <Button variant="destructive" onClick={handleClearEmails}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Emails
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Emails</TabsTrigger>
          <TabsTrigger value="order-confirmation">Order Confirmation</TabsTrigger>
          <TabsTrigger value="order-processing">Processing</TabsTrigger>
          <TabsTrigger value="order-shipped">Shipped</TabsTrigger>
          <TabsTrigger value="order-delivered">Delivered</TabsTrigger>
          <TabsTrigger value="order-cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Sent Emails</CardTitle>
                <CardDescription>
                  {filteredEmails.length} email{filteredEmails.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No emails found</div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedEmail?.id === email.id ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium truncate">{email.subject}</div>
                          <div
                            className={`text-xs px-2 py-1 rounded-full ${
                              email.status === "sent" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {email.status}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground truncate mt-1">To: {email.to}</div>
                        <div className="text-xs text-muted-foreground mt-1">{formatDate(email.sentAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedEmail ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedEmail.subject}</CardTitle>
                    <CardDescription>
                      Sent to {selectedEmail.to} on {formatDate(selectedEmail.sentAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Template:</span> {selectedEmail.template}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <span className={selectedEmail.status === "sent" ? "text-green-600" : "text-red-600"}>
                          {selectedEmail.status}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="border rounded-md overflow-hidden">
                      <EmailTemplatePreview template={selectedEmail.template} data={selectedEmail.data} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Select an email to preview
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
