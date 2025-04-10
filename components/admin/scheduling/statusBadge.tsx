import { Badge } from "lucide-react"

export const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
    };
  
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
