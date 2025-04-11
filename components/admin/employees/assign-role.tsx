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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Award, Building } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdminBranches } from "@/hooks/use-branch"

interface AssignRoleDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  employee: any
  roles: string[]
  branches: string[]
  onAssign: (role: string, branch: string) => void
}

export function AssignRoleDialog({
  isOpen,
  setIsOpen,
  employee,
  roles,
  branches,
  onAssign
}: AssignRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [isRoleChanged, setIsRoleChanged] = useState(false)
  const [isBranchChanged, setIsBranchChanged] = useState(false)
    
  const { fetchBranches, branches: employeeBranch } = useAdminBranches()
    
      useEffect(() => {
        fetchBranches()
      }, [fetchBranches])
  
  // Initialize selections when dialog opens
  useEffect(() => {
    if (employee) {
      setSelectedRole(employee.role || "")
      setSelectedBranch(employee.branch || "")
      setIsRoleChanged(false)
      setIsBranchChanged(false)
    }
  }, [employee, isOpen])
  
  // Check if selections have changed
  useEffect(() => {
    if (employee) {
      setIsRoleChanged(selectedRole !== employee.role)
      setIsBranchChanged(selectedBranch !== employee.branch)
    }
  }, [selectedRole, selectedBranch, employee])
  
  // Handle role selection
  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
  }
  
  // Handle branch selection
  const handleBranchChange = (value: string) => {
    setSelectedBranch(value)
  }
  
  // Handle form submission
  const handleSubmit = () => {
    onAssign(selectedRole, selectedBranch)
  }
  
  // Check if anything has changed
  const hasChanges = isRoleChanged || isBranchChanged

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Role & Branch</DialogTitle>
          <DialogDescription>
            Update the role and branch assignment for {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 my-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {employee.first_name[0]}{employee.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employee.first_name} {employee.last_name}</div>
            <div className="text-sm text-gray-500">
              Current Role: {employee.role} | Branch: {employeeBranch.find((b: any) => b.id === employee.branch_id)?.name || "N/A"}
            </div>
          </div>
        </div>
        
        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-500" /> 
              Role
            </label>
            <Select
              value={selectedRole}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isRoleChanged && (
              <div className="text-xs text-blue-600">
                Changing from {employee.role} to {selectedRole}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" /> 
              Branch
            </label>
            <Select
              value={selectedBranch}
              onValueChange={handleBranchChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isBranchChanged && (
              <div className="text-xs text-blue-600">
                Changing from {employee.branch} to {selectedBranch}
              </div>
            )}
          </div>
          
          {hasChanges && (
            <Alert>
              <AlertDescription>
                Changing an employee's role or branch may affect their scheduled assignments and responsibilities.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}