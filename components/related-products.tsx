import ProductCard from "@/components/product-card"

// Mock related products
const relatedProducts = [
  {
    title: "Bear Amigurumi",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
  },
  {
    title: "Fox Amigurumi",
    price: 26.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
  },
  {
    title: "Elephant Amigurumi",
    price: 32.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
  },
  {
    title: "Unicorn Amigurumi",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
  },
]

export default function RelatedProducts() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold">You May Also Like</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product, index) => (
          <ProductCard
            key={index}
            title={product.title}
            price={product.price}
            image={product.image}
            rating={product.rating}
          />
        ))}
      </div>
    </section>
  )
}
