import { YoutubeIcon, Upload, Users, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatorApplicationForm from "@/components/collaboration/creator-application-form"

export default function CreatorSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-rose-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-600">
            <YoutubeIcon className="mr-1 h-3.5 w-3.5" />
            <span>Creator Collaboration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Join Our Community of Crochet Creators
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Share your patterns, sell your products, and grow your audience with our platform
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <Tabs defaultValue="benefits" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              <TabsTrigger value="apply">Apply Now</TabsTrigger>
            </TabsList>

            <TabsContent value="benefits" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm">
                  <div className="mb-4 rounded-full bg-rose-100 p-3">
                    <ShoppingBag className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Sell Your Patterns</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and sell your crochet patterns directly to our engaged community of crafters.
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm">
                  <div className="mb-4 rounded-full bg-rose-100 p-3">
                    <Users className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Grow Your Audience</h3>
                  <p className="text-sm text-muted-foreground">
                    Reach new customers and followers through our platform and cross-promotion opportunities.
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm">
                  <div className="mb-4 rounded-full bg-rose-100 p-3">
                    <Upload className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">Custom Storefront</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your own branded storefront page to showcase your unique crochet creations.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button className="bg-rose-500 hover:bg-rose-600">Learn More</Button>
              </div>
            </TabsContent>

            <TabsContent value="how-it-works" className="mt-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-medium">How to Become a Creator Partner</h3>

                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Apply to Join</h4>
                      <p className="text-sm text-muted-foreground">
                        Fill out our creator application form with details about your YouTube channel and crochet
                        experience.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Get Approved</h4>
                      <p className="text-sm text-muted-foreground">
                        Our team will review your application and reach out to discuss partnership opportunities.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Set Up Your Store</h4>
                      <p className="text-sm text-muted-foreground">
                        Create your profile, customize your storefront, and upload your patterns and products.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Start Selling</h4>
                      <p className="text-sm text-muted-foreground">
                        Begin selling your patterns and products while we handle payments, customer service, and
                        delivery.
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    <span className="font-medium">Creator Commission:</span> Earn 80% of each sale from your patterns
                    and products. Monthly payments directly to your account.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="apply" className="mt-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="mb-6 text-xl font-medium">Creator Application</h3>
                <CreatorApplicationForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-16">
          <h3 className="mb-6 text-center text-xl font-medium">Featured Creator Partners</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="mb-2 h-16 w-16 overflow-hidden rounded-full bg-rose-100">
                  <img
                    src={`/placeholder.svg?height=64&width=64&text=Creator${i}`}
                    alt={`Creator ${i}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Crochet Creator {i}</p>
                <p className="text-xs text-muted-foreground">10K+ followers</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
