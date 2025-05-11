import { Button } from "@/components/ui/button"
import { Mail, Phone, User } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

interface OrderCustomerInfoProps {
  customer: Customer
}

export function OrderCustomerInfo({ customer }: OrderCustomerInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{customer.name}</h3>
          <p className="text-sm text-muted-foreground">Customer since {new Date().getFullYear()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{customer.email}</span>
        </div>

        {customer.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          View Customer
        </Button>
        <Button variant="outline" size="sm">
          View All Orders
        </Button>
      </div>
    </div>
  )
}
