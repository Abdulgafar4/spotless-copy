import React from 'react';

interface PaymentOptionsProps {
  // Required props
  selectedOption: "full" | "deposit";
  onOptionChange: (option: "full" | "deposit") => void;
  
  // Pricing functions
  calculateFullPaymentAmount: () => number;
  calculateDepositAmount: () => number;
  calculateOriginalAmount: () => number;
  
  // Utility functions
  formatCurrency: (amount: number) => string;
  
  // Optional props for customization
  showServiceCheck?: boolean;
  serviceSelected?: boolean;
  className?: string;
  
  // Optional custom labels
  fullPaymentLabel?: string;
  depositLabel?: string;
  fullPaymentDescription?: string;
  depositDescription?: string;
}

export function PaymentOptions({
  selectedOption,
  onOptionChange,
  calculateFullPaymentAmount,
  calculateDepositAmount,
  calculateOriginalAmount,
  formatCurrency,
  showServiceCheck = true,
  serviceSelected = true,
  className = "",
  fullPaymentLabel = "Pay in Full",
  depositLabel = "Pay Deposit",
  fullPaymentDescription = "Complete payment now and save money",
  depositDescription = "Pay 70% now, remaining 30% after service"
}: PaymentOptionsProps) {
  
  // Don't render if service check is enabled and no service is selected
  if (showServiceCheck && !serviceSelected) {
    return null;
  }

  const originalAmount = calculateOriginalAmount();
  const fullAmount = calculateFullPaymentAmount();
  const depositAmount = calculateDepositAmount();
  const discountAmount = originalAmount * 0.05;
  const remainingAmount = originalAmount * 0.3;

  return (
    <div className={`mt-6 space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Option</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Full Payment Option */}
        <div 
          className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
            selectedOption === "full" 
              ? "border-green-500 bg-green-50 shadow-md" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }`}
          onClick={() => onOptionChange("full")}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="radio"
                  id="payment-full"
                  name="paymentOption"
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  checked={selectedOption === "full"}
                  onChange={() => onOptionChange("full")}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="payment-full" className="cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-semibold text-gray-900">{fullPaymentLabel}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Save 5%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {fullPaymentDescription}
                  </p>
                </label>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(fullAmount)}
              </div>
              <div className="text-xs text-gray-500 line-through">
                {formatCurrency(originalAmount)}
              </div>
            </div>
          </div>
          
          {selectedOption === "full" && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Original Price:</span>
                <span className="text-green-700">{formatCurrency(originalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Discount (5%):</span>
                <span className="text-green-700">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-t border-green-200 pt-2 mt-2">
                <span className="text-green-800">Total:</span>
                <span className="text-green-800">{formatCurrency(fullAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Option */}
        <div 
          className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
            selectedOption === "deposit" 
              ? "border-green-500 bg-green-50 shadow-md" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }`}
          onClick={() => onOptionChange("deposit")}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="radio"
                  id="payment-deposit"
                  name="paymentOption"
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  checked={selectedOption === "deposit"}
                  onChange={() => onOptionChange("deposit")}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="payment-deposit" className="cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-semibold text-gray-900">{depositLabel}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      70% Now
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {depositDescription}
                  </p>
                </label>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(depositAmount)}
              </div>
              <div className="text-xs text-gray-500">
                Now
              </div>
            </div>
          </div>
          
          {selectedOption === "deposit" && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Total Service Cost:</span>
                <span className="text-green-700">{formatCurrency(originalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Pay Now (70%):</span>
                <span className="text-green-700 font-semibold">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Pay Later (30%):</span>
                <span className="text-green-700">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">You will pay today:</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedOption === "full" 
                ? formatCurrency(fullAmount)
                : formatCurrency(depositAmount)
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Service Total:</p>
            <p className="text-lg font-semibold text-gray-700">
              {selectedOption === "full" 
                ? formatCurrency(fullAmount)
                : formatCurrency(originalAmount)
              }
            </p>
            {selectedOption === "full" && (
              <p className="text-xs text-green-600 font-medium">5% savings applied!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}