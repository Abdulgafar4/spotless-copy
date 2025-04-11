import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageIcon, X, Scroll } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onUpload: (file: File) => Promise<string>
}

export function ImageUpload({ value, onChange, onUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent default to ensure no form submission occurs
    e.preventDefault()
    
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("This spell only works on image scrolls!")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Your scroll is too powerful (exceeds 5MB)!")
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
      const imageUrl = await onUpload(file)
      onChange(imageUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("The summoning ritual failed! Try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.preventDefault()
    e.stopPropagation()
    
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent default to ensure no form submission occurs
    e.preventDefault()
    
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full flex flex-col items-center border-2 border-amber-800 bg-amber-50 rounded-lg p-6 relative">
          {value ? (
            <div className="relative w-full">
              <img 
                src={value} 
                alt="Preview" 
                className="rounded-md object-cover mx-auto max-h-64 border-4 border-amber-700 shadow-lg"
              />
              <Button
                onClick={handleRemoveImage}
                type="button" // Explicitly set type to prevent form submission
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 h-8 w-8"
                size="icon"
                variant="destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-48 bg-amber-100 border-2 border-dashed border-amber-600 rounded-md">
              <Scroll className="h-12 w-12 text-amber-700 mb-2" />
              <p className="text-amber-800 font-serif text-lg text-center">No scroll selected</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Button
              onClick={handleButtonClick}
              type="button" // Explicitly set type to prevent form submission
              disabled={isUploading}
              className="bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif rounded-md border-2 border-amber-900 shadow-md transition-all hover:shadow-xl px-6 py-2"
            >
              {isUploading ? (
                <span className="animate-pulse">Summoning in progress...</span>
              ) : (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>{value ? "Change Image Scroll" : "Summon Image Scroll"}</span>
                </div>
              )}
            </Button>
          </div>
          
          {uploadError && (
            <div className="mt-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded font-serif text-center">
              {uploadError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}