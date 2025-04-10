import React from 'react';
import { Card } from "@/components/ui/card"
import { StatusBadge } from "./statusBadge"


export const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="p-0 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="space-y-1">
          <div className="font-medium">{appointment.title}</div>
          <div className="text-sm text-gray-500">{appointment.time} ({appointment.duration})</div>
          <StatusBadge status={appointment.status} />
        </div>
        <div className="space-y-1">
          <div className="font-medium">{appointment.customer}</div>
          <div className="text-sm text-gray-500">{appointment.phone}</div>
        </div>
        <div className="space-y-1">
          <div className="font-medium">{appointment.branch}</div>
          <div className="text-sm text-gray-500 truncate">{appointment.address}</div>
        </div>
        <div className="space-y-1">
          <div className="font-medium">Staff ({appointment.staff.length})</div>
          <div className="text-sm text-gray-500 truncate">{appointment.staff.join(", ")}</div>
        </div>
      </div>
    </Card>
  );