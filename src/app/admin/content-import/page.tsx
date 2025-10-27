'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
// import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Upload, RefreshCw } from 'lucide-react'

interface ImportJob {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  errors: string[]
}

export default function ContentImportPage() {
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startBulkImport = async () => {
    setIsImporting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/content/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bulk_import',
          options: {
            downloadMedia: true,
            extractAudio: true,
            generateThumbnails: true,
            quality: 'medium'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      setCurrentJob({
        jobId: result.jobId,
        status: 'pending',
        totalItems: 0,
        processedItems: 0,
        successfulItems: 0,
        failedItems: 0,
        errors: []
      })

      // Start polling for status
      pollJobStatus(result.jobId)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsImporting(false)
    }
  }

  const startResumeImport = async () => {
    setIsImporting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/content/resume-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize: 5,
          delayBetweenBatches: 3000,
          maxRetries: 3,
          skipExisting: true
        })
      })

      if (!response.ok) {
        throw new Error(`Resume import failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      setCurrentJob({
        jobId: result.jobId,
        status: 'running',
        totalItems: 98, // We know there are 98 remaining
        processedItems: 0,
        successfulItems: 0,
        failedItems: 0,
        errors: []
      })

      // Start polling for status using the resume import endpoint
      pollResumeJobStatus(result.jobId)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsImporting(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/content/import?jobId=${jobId}`)
      const status = await response.json()
      
      setCurrentJob(status)
      
      if (status.status === 'completed' || status.status === 'failed') {
        setIsImporting(false)
      } else if (status.status === 'running' || status.status === 'pending') {
        // Continue polling
        setTimeout(() => pollJobStatus(jobId), 3000)
      }
      
    } catch (err) {
      console.error('Failed to get job status:', err)
      setIsImporting(false)
    }
  }

  const pollResumeJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/content/resume-import?jobId=${jobId}`)
      const status = await response.json()
      
      setCurrentJob(status)
      
      if (status.status === 'completed' || status.status === 'failed') {
        setIsImporting(false)
      } else if (status.status === 'running' || status.status === 'pending') {
        // Continue polling
        setTimeout(() => pollResumeJobStatus(jobId), 3000)
      }
      
    } catch (err) {
      console.error('Failed to get resume job status:', err)
      setIsImporting(false)
    }
  }

  const getProgress = () => {
    if (!currentJob || currentJob.totalItems === 0) return 0
    return Math.round((currentJob.processedItems / currentJob.totalItems) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default: return <Upload className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Import Manager</h1>
      </div>

      {/* Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import from Google Classroom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Import all 184 topics with their slides, videos, and audio files from Google Classroom 
            into your local database. This will make your application completely independent.
          </p>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={startBulkImport}
                disabled={isImporting}
                className="flex items-center space-x-2"
              >
                {isImporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>
                  {isImporting ? 'Importing...' : 'Start Bulk Import'}
                </span>
              </Button>

              <Button 
                onClick={startResumeImport}
                disabled={isImporting}
                variant="outline"
                className="flex items-center space-x-2 border-green-600 text-green-600 hover:bg-green-50"
              >
                {isImporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>
                  Resume Import (98 remaining)
                </span>
              </Button>
              
              {currentJob && (
                <div className="flex items-center space-x-2">
                  {getStatusIcon(currentJob.status)}
                  <span className={`text-sm font-medium ${getStatusColor(currentJob.status)}`}>
                    {currentJob.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              <strong>Bulk Import:</strong> Import all topics from scratch (may timeout with large datasets)<br/>
              <strong>Resume Import:</strong> Continue importing remaining 98 topics with better error handling
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Progress */}
      {currentJob && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Items</div>
                <div className="text-2xl font-bold">{currentJob.totalItems}</div>
              </div>
              <div>
                <div className="font-medium">Processed</div>
                <div className="text-2xl font-bold text-blue-600">{currentJob.processedItems}</div>
              </div>
              <div>
                <div className="font-medium">Successful</div>
                <div className="text-2xl font-bold text-green-600">{currentJob.successfulItems}</div>
              </div>
              <div>
                <div className="font-medium">Failed</div>
                <div className="text-2xl font-bold text-red-600">{currentJob.failedItems}</div>
              </div>
            </div>

            {currentJob.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Errors:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {currentJob.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentJob.status === 'completed' && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  Import completed successfully! Your content is now stored locally and 
                  ready to be displayed in the application.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>What happens during import?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Extracts all slides from Google Classroom presentations</li>
            <li>Downloads YouTube videos and creates local references</li>
            <li>Extracts audio files and speaker notes</li>
            <li>Generates thumbnails for all visual content</li>
            <li>Stores everything in your Neon database</li>
            <li>Makes your application fully independent from Google services</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}