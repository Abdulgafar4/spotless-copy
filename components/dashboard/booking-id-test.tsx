"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBookingIdSync } from "@/lib/booking-id-generator";

export default function BookingIdTest() {
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [highestId, setHighestId] = useState<number>(0);

  const handleGenerateId = () => {
    const newId = generateBookingIdSync(highestId);
    setHighestId(highestId + 1);
    setBookingIds(prev => [...prev, newId]);
  };

  const handleReset = () => {
    setBookingIds([]);
    setHighestId(0);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Booking ID Generator Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Button onClick={handleGenerateId}>Generate New ID</Button>
            <Button variant="outline" onClick={handleReset}>Reset</Button>
          </div>

          <div className="border rounded-md p-4 bg-muted">
            <h3 className="font-medium mb-2">Generated Booking IDs:</h3>
            {bookingIds.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {bookingIds.map((id, index) => (
                  <div key={index} className="bg-card border rounded p-2 text-center">
                    {id}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No IDs generated yet. Click the button above to generate IDs.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}