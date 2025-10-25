'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play,
  Volume2,
  FileText,
  Pen,
  Mic,
  BookOpen
} from 'lucide-react'

interface SpanishExercise {
  id: string
  title: string
  instructions: string
  type: string
  category: string
  phase: string
  content: any
  points: number
  submissions?: Array<{
    id: string
    score: number
    submittedAt: string
    feedback: string
  }>
}

interface SpanishExerciseCardProps {
  exercise: SpanishExercise
  onSubmit?: () => void
}

export default function SpanishExerciseCard({ exercise, onSubmit }: SpanishExerciseCardProps) {
  const [answer, setAnswer] = useState<any>('')
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState(exercise.submissions?.[0])
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = async () => {
    if (!answer) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/exercises/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          answer,
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setSubmission(result)
        setShowFeedback(true)
        
        if (onSubmit) {
          onSubmit()
        }
      } else {
        alert('Error al enviar el ejercicio. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error submitting exercise:', error)
      alert('Error al enviar el ejercicio. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              {exercise.content.question}
            </p>
            <RadioGroup value={answer} onValueChange={setAnswer}>
              {exercise.content.options?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              {exercise.content.statement}
            </p>
            <RadioGroup value={answer} onValueChange={setAnswer}>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">Verdadero</Label>
              </div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">Falso</Label>
              </div>
            </RadioGroup>
          </div>
        )

      case 'GAP_FILL':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              Completa la oración con la palabra correcta:
            </p>
            <div className="text-lg leading-relaxed p-4 bg-gray-50 rounded-lg">
              {exercise.content.text?.split('___').map((part: string, index: number, array: string[]) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <Input
                      className="inline-block w-32 mx-2 text-center"
                      placeholder="..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        )

      case 'MATCHING':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              Conecta las palabras con sus definiciones correctas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Palabras</h4>
                {exercise.content.pairs?.map((pair: any, index: number) => (
                  <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded">
                    {pair.word}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Definiciones</h4>
                {exercise.content.pairs?.map((pair: any, index: number) => (
                  <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded">
                    {pair.definition}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              (Esta es una vista previa. La funcionalidad completa de arrastrar y soltar será implementada próximamente)
            </p>
          </div>
        )

      case 'ESSAY':
      case 'ERROR_CORRECTION':
        return (
          <div className="space-y-4">
            {exercise.content.prompt && (
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                {exercise.content.prompt}
              </p>
            )}
            {exercise.content.text && (
              <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Texto para analizar:</h4>
                <p className="text-sm text-gray-700">{exercise.content.text}</p>
              </div>
            )}
            <Textarea
              placeholder="Escribe tu respuesta aquí..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="resize-none"
            />
            {exercise.content.minWords && (
              <p className="text-xs text-gray-500">
                Mínimo {exercise.content.minWords} palabras
              </p>
            )}
          </div>
        )

      case 'AUDIO_RECORDING':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
              {exercise.content.prompt || 'Graba tu pronunciación del siguiente texto:'}
            </p>
            {exercise.content.text && (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-medium text-gray-900">
                  "{exercise.content.text}"
                </p>
              </div>
            )}
            <div className="flex flex-col items-center space-y-4 p-6 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
              <Mic className="h-12 w-12 text-red-500" />
              <p className="text-center text-gray-600">
                Funcionalidad de grabación de audio próximamente
              </p>
              <Button variant="outline" disabled>
                <Mic className="h-4 w-4 mr-2" />
                Grabar Audio
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            Tipo de ejercicio {exercise.type} en desarrollo.
          </div>
        )
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'READING': return BookOpen
      case 'WRITING': return Pen
      case 'LISTENING': return Volume2
      case 'SPEAKING': return Mic
      case 'GRAMMAR': return FileText
      case 'VOCABULARY': return FileText
      default: return FileText
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      READING: 'bg-blue-100 text-blue-800 border-blue-200',
      WRITING: 'bg-green-100 text-green-800 border-green-200',
      LISTENING: 'bg-purple-100 text-purple-800 border-purple-200',
      SPEAKING: 'bg-red-100 text-red-800 border-red-200',
      GRAMMAR: 'bg-orange-100 text-orange-800 border-orange-200',
      VOCABULARY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPhaseColor = (phase: string) => {
    return phase === 'PRE_CLASS' 
      ? 'bg-indigo-100 text-indigo-800' 
      : 'bg-emerald-100 text-emerald-800'
  }

  const hasSubmitted = submission && submission.score !== null
  const CategoryIcon = getCategoryIcon(exercise.category)

  return (
    <Card className="exercise-card fade-in border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-3">
              {exercise.title}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge className={getCategoryColor(exercise.category)}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {exercise.category}
              </Badge>
              <Badge className={getPhaseColor(exercise.phase)}>
                {exercise.phase === 'PRE_CLASS' ? 'Pre-Clase' : 'Post-Clase'}
              </Badge>
              <Badge variant="outline">
                {exercise.points} puntos
              </Badge>
              {hasSubmitted && (
                <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {submission.score}/{exercise.points}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {exercise.instructions}
        </p>
        
        {renderExerciseContent()}

        {showFeedback && submission && (
          <div className={`p-3 rounded-lg ${
            submission.score === exercise.points 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {submission.score === exercise.points ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                Puntuación: {submission.score}/{exercise.points}
              </span>
            </div>
            {submission.feedback && (
              <p className="text-sm">{submission.feedback}</p>
            )}
          </div>
        )}

        {!hasSubmitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={!answer || submitting}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
          >
            {submitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Respuesta'
            )}
          </Button>
        )}

        {hasSubmitted && !showFeedback && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Ya completado • Puntuación: {submission.score}/{exercise.points}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFeedback(true)}
            >
              Ver Retroalimentación
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}