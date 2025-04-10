import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ServiceCardProps {
  title: string
  description: string
  image: string
  category: string
}

export default function ServiceCard({ title, description, image, category }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <Badge variant="outline" className="bg-gray-100">
          {category}
        </Badge>
        <Button variant="outline" className="text-green-500 border-green-500 hover:bg-green-50">
          Book Now
        </Button>
      </CardFooter>
    </Card>
  )
}

