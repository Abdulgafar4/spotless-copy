import Link from "next/link"
import { Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface PageHeaderProps {
  title: string
  breadcrumbs: BreadcrumbItem[]
}

export default function PageHeader({ title, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="bg-gray-100 py-6 mt-10 container rounded-xl ">
      <div className=" mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>

        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {index === 0 && <Home className="h-4 w-4 mr-1" />}

              {item.current ? (
                <span className="font-medium">{item.label}</span>
              ) : (
                <>
                  <Link href={item.href} className="hover:text-green-500">
                    {item.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">›</span>}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

