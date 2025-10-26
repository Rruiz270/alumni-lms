import { google } from 'googleapis'

interface ClassroomContent {
  slides: SlideContent[]
  videos: VideoContent[]
  documents: DocumentContent[]
}

interface SlideContent {
  id: string
  title: string
  thumbnail: string
  embedUrl: string
  fullUrl: string
}

interface VideoContent {
  id: string
  title: string
  thumbnail: string
  embedUrl: string
  duration?: string
}

interface DocumentContent {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'worksheet'
  downloadUrl: string
  previewUrl?: string
}

export class GoogleClassroomContentExtractor {
  private auth: any

  constructor() {
    this.initAuth()
  }

  private async initAuth() {
    try {
      let serviceAccountKey: any

      // Try method 1: Single JSON environment variable (recommended)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
          serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
        } catch (error) {
          console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error)
        }
      }

      // Method 2: Reconstruct from individual environment variables (fallback)
      if (!serviceAccountKey && process.env.GOOGLE_PROJECT_ID) {
        serviceAccountKey = {
          type: "service_account",
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
        }
      }

      if (!serviceAccountKey) {
        throw new Error('No Google Service Account credentials found. Please set GOOGLE_SERVICE_ACCOUNT_KEY or individual Google environment variables.')
      }

      this.auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: [
          'https://www.googleapis.com/auth/presentations.readonly',
          'https://www.googleapis.com/auth/drive.readonly'
        ]
      })
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error)
      this.auth = null
    }
  }

  // Extract presentation ID from Google Slides URL
  private extractPresentationId(url: string): string | null {
    const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  // Extract folder ID from Google Drive folder URL
  private extractFolderId(url: string): string | null {
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  // Extract document ID from Google Docs URL
  private extractDocumentId(url: string): string | null {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  // Get slide content from Google Slides
  async getSlidesContent(presentationId: string): Promise<SlideContent[]> {
    try {
      const slides = google.slides({ version: 'v1', auth: this.auth })
      
      const presentation = await slides.presentations.get({
        presentationId: presentationId
      })

      const slideContent: SlideContent[] = []
      
      if (presentation.data.slides) {
        for (const slide of presentation.data.slides) {
          if (slide.objectId) {
            const thumbnailUrl = `https://docs.google.com/presentation/d/${presentationId}/export/png?id=${presentationId}&pageid=${slide.objectId}`
            
            slideContent.push({
              id: slide.objectId,
              title: `Slide ${slideContent.length + 1}`,
              thumbnail: thumbnailUrl,
              embedUrl: `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&slide=${slide.objectId}`,
              fullUrl: `https://docs.google.com/presentation/d/${presentationId}/edit#slide=${slide.objectId}`
            })
          }
        }
      }

      return slideContent
    } catch (error) {
      console.error('Error fetching slides content:', error)
      return []
    }
  }

  // Get content from Google Drive folder
  async getFolderContent(folderId: string): Promise<{ videos: VideoContent[], documents: DocumentContent[] }> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.auth })
      
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink)',
        orderBy: 'name'
      })

      const videos: VideoContent[] = []
      const documents: DocumentContent[] = []

      if (response.data.files) {
        for (const file of response.data.files) {
          if (file.mimeType?.startsWith('video/')) {
            videos.push({
              id: file.id!,
              title: file.name!,
              thumbnail: file.thumbnailLink || '/default-video-thumb.png',
              embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
              duration: 'Unknown'
            })
          } else if (file.mimeType?.includes('document') || file.mimeType?.includes('pdf')) {
            documents.push({
              id: file.id!,
              title: file.name!,
              type: file.mimeType?.includes('pdf') ? 'pdf' : 'doc',
              downloadUrl: file.webContentLink || '',
              previewUrl: file.webViewLink || ''
            })
          }
        }
      }

      return { videos, documents }
    } catch (error) {
      console.error('Error fetching folder content:', error)
      return { videos: [], documents: [] }
    }
  }

  // Main method to extract all content from a classroom link
  async extractClassroomContent(classroomLink: string): Promise<ClassroomContent> {
    const content: ClassroomContent = {
      slides: [],
      videos: [],
      documents: []
    }

    try {
      // Check if it's a Google Slides presentation
      const presentationId = this.extractPresentationId(classroomLink)
      if (presentationId) {
        content.slides = await this.getSlidesContent(presentationId)
      }

      // Check if it's a Google Drive folder
      const folderId = this.extractFolderId(classroomLink)
      if (folderId) {
        const folderContent = await this.getFolderContent(folderId)
        content.videos = folderContent.videos
        content.documents = folderContent.documents
      }

      // If it's a Google Classroom link, we need to extract the embedded content
      if (classroomLink.includes('classroom.google.com')) {
        // For now, return simulated content since Google Classroom API requires special permissions
        content.slides = await this.generateSimulatedSlides(classroomLink)
        content.videos = this.generateSimulatedVideos()
        content.documents = this.generateSimulatedDocuments()
      }

    } catch (error) {
      console.error('Error extracting classroom content:', error)
    }

    return content
  }

  // Generate simulated content for demonstration
  private async generateSimulatedSlides(link: string): Promise<SlideContent[]> {
    // Create realistic slide content based on the topic
    return [
      {
        id: 'slide-1',
        title: 'Introducción al Tema',
        thumbnail: 'https://via.placeholder.com/400x300/4285f4/ffffff?text=Slide+1',
        embedUrl: link,
        fullUrl: link
      },
      {
        id: 'slide-2',
        title: 'Vocabulario Clave',
        thumbnail: 'https://via.placeholder.com/400x300/34a853/ffffff?text=Slide+2',
        embedUrl: link,
        fullUrl: link
      },
      {
        id: 'slide-3',
        title: 'Ejercicios Prácticos',
        thumbnail: 'https://via.placeholder.com/400x300/fbbc04/ffffff?text=Slide+3',
        embedUrl: link,
        fullUrl: link
      },
      {
        id: 'slide-4',
        title: 'Resumen y Conclusiones',
        thumbnail: 'https://via.placeholder.com/400x300/ea4335/ffffff?text=Slide+4',
        embedUrl: link,
        fullUrl: link
      }
    ]
  }

  private generateSimulatedVideos(): VideoContent[] {
    return [
      {
        id: 'video-1',
        title: 'Pronunciación y Fonética',
        thumbnail: 'https://via.placeholder.com/400x225/ff6b6b/ffffff?text=Video+1',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '5:23'
      },
      {
        id: 'video-2',
        title: 'Conversación Práctica',
        thumbnail: 'https://via.placeholder.com/400x225/4ecdc4/ffffff?text=Video+2',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '8:15'
      }
    ]
  }

  private generateSimulatedDocuments(): DocumentContent[] {
    return [
      {
        id: 'doc-1',
        title: 'Guía de Ejercicios',
        type: 'pdf',
        downloadUrl: '#',
        previewUrl: '#'
      },
      {
        id: 'doc-2',
        title: 'Vocabulario Complementario',
        type: 'doc',
        downloadUrl: '#',
        previewUrl: '#'
      },
      {
        id: 'doc-3',
        title: 'Hoja de Trabajo',
        type: 'worksheet',
        downloadUrl: '#',
        previewUrl: '#'
      }
    ]
  }
}

export type { ClassroomContent, SlideContent, VideoContent, DocumentContent }