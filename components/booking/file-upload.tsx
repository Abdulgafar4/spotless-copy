"use client"

import { toast } from "sonner"
import { AlertCircle, FileX, Upload } from "lucide-react"
import { ChangeEvent, useState } from "react"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "./booking-types"
import { FormDescription } from "@/components/ui/form"

interface FileUploadProps {
  files: File[]
  setFiles: (files: File[]) => void
  required?: boolean
}

export function FileUpload({ files, setFiles, required = true }: FileUploadProps) {
  const [fileErrors, setFileErrors] = useState<string[]>([])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const errors: string[] = []
      
      const validFiles = newFiles.filter(file => {
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          errors.push(`"${file.name}" is not a valid image format. Please use JPG, PNG, or WebP.`)
          return false
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`"${file.name}" exceeds the maximum size of 5MB.`)
          return false
        }
        
        return true
      })
      
      // Limit total files to 10
      if (files.length + validFiles.length <= 10) {
        setFiles([...files, ...validFiles])
      } else {
        errors.push("Maximum 10 images allowed")
      }
      
      setFileErrors(errors)
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
      }
    }
  }
  
  // Remove file from the list
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <Upload className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
      <p className="text-sm text-gray-600 mb-2">
        Drag/Drop to Upload Property Photos
        {required && <span className="text-red-500">*</span>}
      </p>
      <div className="flex flex-col space-y-2 text-xs text-gray-500 mb-4">
        <p>Maximum 10 images</p>
        <p>Accepted formats: JPG, PNG, WebP</p>
        <p>Maximum file size: 5MB per image</p>
        {required && (
          <FormDescription className="text-xs text-red-500">
            At least one property photo is required
          </FormDescription>
        )}
      </div>
      <input 
        type="file" 
        id="file-upload" 
        className="hidden" 
        multiple 
        accept="image/jpeg,image/png,image/jpg,image/webp" 
        onChange={handleFileChange} 
      />
      <label 
        htmlFor="file-upload" 
        className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm"
      >
        Select Files
      </label>
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2 text-left">Selected Files:</h4>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FileX className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {fileErrors.length > 0 && (
        <div className="mt-4 text-left">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">File upload issues:</h4>
                <ul className="list-disc pl-5 mt-1 text-xs text-red-700 space-y-1">
                  {fileErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}