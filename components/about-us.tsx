import { SyringeIcon as Needle, Heart, Sparkles, Users } from "lucide-react"

export default function AboutUs() {
  return (
    <section className="w-full py-12 md:py-24" id="about">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Our Story</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">About CrochetCuteness</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Handcrafted with love, bringing joy through every stitch
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <p className="mb-6 text-lg leading-relaxed">
            CrochetCuteness was born from a passion for creating beautiful, handcrafted items that bring warmth and joy
            to homes around the world. What started as a hobby has blossomed into a community of crochet enthusiasts
            sharing their love for this timeless craft.
          </p>
          <p className="mb-10 text-lg leading-relaxed">
            We believe in the magic of handmade items – each piece tells a story and carries the care and attention of
            its creator. Our mission is to share the art of crochet through high-quality products, patterns, and a
            supportive community where creators can showcase their talents.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-rose-100 p-3">
              <Needle className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Quality Craftsmanship</h3>
            <p className="text-muted-foreground">
              Every item is meticulously crafted using premium yarns and sustainable practices.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-rose-100 p-3">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Made with Love</h3>
            <p className="text-muted-foreground">
              Each stitch is created with care, bringing warmth and character to every piece.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-rose-100 p-3">
              <Sparkles className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Unique Designs</h3>
            <p className="text-muted-foreground">
              Our patterns and products feature original designs you won't find anywhere else.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-rose-100 p-3">
              <Users className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Creator Community</h3>
            <p className="text-muted-foreground">
              We support a thriving community of crochet artists who share their passion and expertise.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Crocheting hands"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-2xl font-bold">Our Commitment</h3>
            <p className="text-muted-foreground">
              At CrochetCuteness, we're committed to preserving and promoting the art of crochet. We believe in creating
              products that are not only beautiful but also sustainable and ethically made.
            </p>
            <p className="text-muted-foreground">
              We work with talented creators from around the world, providing a platform for them to share their designs
              and connect with crochet enthusiasts. Whether you're looking for a finished product, a pattern to create
              your own, or inspiration for your next project, we're here to support your crochet journey.
            </p>
            <p className="text-muted-foreground">
              Join our community and discover the joy of handmade crochet items that add warmth, character, and charm to
              everyday life.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
