"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, User, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AssignStaffDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  booking: any
  onAssign: (staff: string[]) => void
}

// Mock staff members data
const mockStaffMembers = [
  { id: 1, name: "Emma Wilson", role: "Cleaner", branch: "Toronto Downtown", status: "available" },
  { id: 2, name: "David Lee", role: "Cleaner", branch: "Toronto Downtown", status: "available" },
  { id: 3, name: "Michael Brown", role: "Cleaner", branch: "Toronto Downtown", status: "busy" },
  { id: 4, name: "Jessica Clark", role: "Cleaner", branch: "Toronto Downtown", status: "available" },
  { id: 5, name: "Kevin Wilson", role: "Cleaner", branch: "North York", status: "available" },
  { id: 6, name: "Laura Taylor", role: "Cleaner", branch: "North York", status: "available" },
  { id: 7, name: "Mark Anderson", role: "Cleaner", branch: "North York", status: "busy" },
  { id: 8, name: "Susan White", role: "Cleaner", branch: "Mississauga", status: "available" },
  { id: 9, name: "James Martin", role: "Cleaner", branch: "Toronto Downtown", status: "available" },
  { id: 10, name: "Nicole Brown", role: "Cleaner", branch: "Toronto Downtown", status: "available" },
  { id: 11, name: "Christopher White", role: "Cleaner", branch: "Mississauga", status: "available" },
  { id: 12, name: "Elizabeth Davis", role: "Cleaner", branch: "Mississauga", status: "busy" },
  { id: 13, name: "Jason Miller", role: "Cleaner", branch: "Mississauga", status: "available" },
];

export function AssignStaffDialog({
  isOpen,
  setIsOpen,
  booking,
  onAssign
}: AssignStaffDialogProps) {
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  
  // Initialize selected staff when the dialog opens
  useEffect(() => {
    if (booking && booking.assignedStaff) {
      setSelectedStaff(booking.assignedStaff)
    } else {
      setSelectedStaff([])
    }
  }, [booking, isOpen])
  
  // Filter staff members
  const filteredStaff = mockStaffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === "" || staff.branch === branchFilter;
    const matchesStatus = statusFilter === "" || staff.status === statusFilter;
    
    return matchesSearch && matchesBranch && matchesStatus;
  });
  
  // Handle staff selection
  const toggleStaffSelection = (staffName: string) => {
    if (selectedStaff.includes(staffName)) {
      setSelectedStaff(selectedStaff.filter(name => name !== staffName));
    } else {
      setSelectedStaff([...selectedStaff, staffName]);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    onAssign(selectedStaff);
  };
  
  // Get unique branches for filter dropdown
  const branches = Array.from(new Set(mockStaffMembers.map(staff => staff.branch)));

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Staff to Booking</DialogTitle>
          <DialogDescription>
            Select staff members to assign to booking {booking.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search staff..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 sm:w-auto w-full">
              <Select
                value={branchFilter}
                onValueChange={setBranchFilter}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedStaff.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Staff ({selectedStaff.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedStaff.map((staffName) => (
                  <div 
                    key={staffName} 
                    className="flex items-center gap-1 bg-white border rounded-full py-1 px-3"
                  >
                    <span className="text-sm">{staffName}</span>
                    <button 
                      onClick={() => toggleStaffSelection(staffName)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredStaff.length > 0 ? (
                <div className="divide-y">
                  {filteredStaff.map((staff) => (
                    <div 
                      key={staff.id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-xs text-gray-500">{staff.role} • {staff.branch}</div>
                        </div>
                      </div>
                      <Checkbox 
                        checked={selectedStaff.includes(staff.name)}
                        onCheckedChange={() => toggleStaffSelection(staff.name)}
                        disabled={staff.status === "busy" && !selectedStaff.includes(staff.name)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <User className="h-10 w-10 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No staff found</h3>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedStaff.length === 0}>
            Assign Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}