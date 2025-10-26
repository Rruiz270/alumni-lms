'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Check, 
  X, 
  Volume2, 
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'

interface Exercise {
  id: string
  type: 'multiple_choice' | 'gap_fill' | 'matching' | 'listening' | 'vocabulary'
  title: string
  instructions: string
  content: any
  correctAnswer?: any
  points: number
}

interface ExerciseRendererProps {
  exercise: Exercise
  onComplete: (score: number, answer: any) => void
  onNext?: () => void
  isLast?: boolean
}

export default function ExerciseRenderer({ exercise, onComplete, onNext, isLast }: ExerciseRendererProps) {
  const [currentAnswer, setCurrentAnswer] = useState<any>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = () => {
    if (!currentAnswer) return
    
    let calculatedScore = 0
    
    // Calculate score based on exercise type
    switch (exercise.type) {
      case 'multiple_choice':
        calculatedScore = currentAnswer === exercise.correctAnswer ? exercise.points : 0
        break
      case 'gap_fill':
        const correctAnswers = exercise.correctAnswer || []
        const userAnswers = currentAnswer || []
        const correctCount = userAnswers.filter((answer: string, index: number) => 
          answer.toLowerCase().trim() === correctAnswers[index]?.toLowerCase().trim()
        ).length
        calculatedScore = Math.round((correctCount / correctAnswers.length) * exercise.points)
        break
      case 'matching':
        const correctMatches = exercise.correctAnswer || {}
        const userMatches = currentAnswer || {}
        const matchCount = Object.keys(correctMatches).filter(key => 
          userMatches[key] === correctMatches[key]
        ).length
        calculatedScore = Math.round((matchCount / Object.keys(correctMatches).length) * exercise.points)
        break
      default:
        calculatedScore = exercise.points
    }
    
    setScore(calculatedScore)
    setIsSubmitted(true)
    setShowFeedback(true)
    onComplete(calculatedScore, currentAnswer)
  }

  const renderExercise = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return renderMultipleChoice()
      case 'gap_fill':
        return renderGapFill()
      case 'matching':
        return renderMatching()
      case 'listening':
        return renderListening()
      case 'vocabulary':
        return renderVocabulary()
      default:
        return <div>Tipo de ejercicio no soportado</div>
    }
  }

  const renderMultipleChoice = () => {
    const { question, options } = exercise.content
    
    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-900">{question}</p>
        <div className="space-y-2">
          {options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => !isSubmitted && setCurrentAnswer(index)}
              disabled={isSubmitted}
              className={`w-full p-3 text-left border-2 rounded-lg transition-all duration-200 ${
                isSubmitted
                  ? index === exercise.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : index === currentAnswer
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                  : currentAnswer === index
                  ? 'border-orange-500 bg-orange-50 text-orange-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isSubmitted && (
                  index === exercise.correctAnswer ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : index === currentAnswer ? (
                    <X className="h-5 w-5 text-red-600" />
                  ) : null
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderGapFill = () => {
    const { text, gaps } = exercise.content
    const answers = currentAnswer || new Array(gaps.length).fill('')
    
    return (
      <div className="space-y-4">
        <div className="text-lg leading-relaxed">
          {text.split('___').map((part: string, index: number) => (
            <span key={index}>
              {part}
              {index < gaps.length && (
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers]
                    newAnswers[index] = e.target.value
                    setCurrentAnswer(newAnswers)
                  }}
                  disabled={isSubmitted}
                  className={`mx-2 px-2 py-1 border-b-2 min-w-[100px] focus:outline-none focus:border-orange-500 ${
                    isSubmitted
                      ? answers[index]?.toLowerCase().trim() === exercise.correctAnswer?.[index]?.toLowerCase().trim()
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder={`(${index + 1})`}
                />
              )}
            </span>
          ))}
        </div>
        
        {isSubmitted && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Respuestas correctas:</h4>
            <div className="space-y-1">
              {exercise.correctAnswer?.map((answer: string, index: number) => (
                <p key={index} className="text-blue-800">
                  {index + 1}. {answer}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMatching = () => {
    const { leftColumn, rightColumn } = exercise.content
    const matches = currentAnswer || {}
    
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Conecta los elementos de la columna izquierda con los de la derecha:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Columna A</h4>
            {leftColumn.map((item: string, index: number) => (
              <div
                key={index}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  matches[index] !== undefined
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isSubmitted && setCurrentAnswer({ ...matches, selectedLeft: index })}
              >
                {item}
                {matches[index] !== undefined && (
                  <span className="ml-2 text-orange-600 font-medium">
                    → {rightColumn[matches[index]]}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Columna B</h4>
            {rightColumn.map((item: string, index: number) => (
              <div
                key={index}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  Object.values(matches).includes(index)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (!isSubmitted && matches.selectedLeft !== undefined) {
                    const newMatches = { ...matches }
                    newMatches[matches.selectedLeft] = index
                    delete newMatches.selectedLeft
                    setCurrentAnswer(newMatches)
                  }
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderListening = () => {
    const { audioUrl, question, options } = exercise.content
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <Volume2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="text-blue-800 font-medium mb-4">Escucha el audio y responde</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // In a real app, this would play the audio
                console.log('Playing audio:', audioUrl)
              }}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Reproducir Audio
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-900">{question}</p>
          <div className="space-y-2">
            {options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => !isSubmitted && setCurrentAnswer(index)}
                disabled={isSubmitted}
                className={`w-full p-3 text-left border-2 rounded-lg transition-all duration-200 ${
                  currentAnswer === index
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderVocabulary = () => {
    const { words, translations } = exercise.content
    const answers = currentAnswer || {}
    
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Selecciona la traducción correcta para cada palabra:</p>
        <div className="space-y-4">
          {words.map((word: string, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">{word}</h4>
                {isSubmitted && answers[index] === exercise.correctAnswer?.[index] && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {translations[index].map((translation: string, tIndex: number) => (
                  <button
                    key={tIndex}
                    onClick={() => !isSubmitted && setCurrentAnswer({ ...answers, [index]: tIndex })}
                    disabled={isSubmitted}
                    className={`p-2 text-left border-2 rounded transition-all duration-200 ${
                      isSubmitted
                        ? tIndex === exercise.correctAnswer?.[index]
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : tIndex === answers[index]
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                        : answers[index] === tIndex
                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {translation}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= exercise.points * 0.8) return 'text-green-600'
    if (score >= exercise.points * 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    const percentage = (score / exercise.points) * 100
    if (percentage >= 80) return '¡Excelente trabajo!'
    if (percentage >= 60) return '¡Buen trabajo!'
    return '¡Sigue practicando!'
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {exercise.title}
            </CardTitle>
            <p className="text-gray-600 mt-1">{exercise.instructions}</p>
          </div>
          <Badge className="bg-orange-100 text-orange-800">
            <Star className="h-4 w-4 mr-1" />
            {exercise.points} puntos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderExercise()}
        
        {showFeedback && score !== null && (
          <div className={`p-4 rounded-lg border-2 ${
            score >= exercise.points * 0.8 
              ? 'border-green-200 bg-green-50' 
              : score >= exercise.points * 0.6
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Resultado</h4>
              <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                {score}/{exercise.points} puntos
              </span>
            </div>
            <p className={getScoreColor(score)}>{getScoreMessage(score)}</p>
            <Progress 
              value={(score / exercise.points) * 100} 
              className="mt-2"
            />
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4">
          {!isSubmitted ? (
            <Button 
              onClick={handleSubmit}
              disabled={!currentAnswer}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Enviar Respuesta
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentAnswer(null)
                  setIsSubmitted(false)
                  setScore(null)
                  setShowFeedback(false)
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
              
              {onNext && (
                <Button 
                  onClick={onNext}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLast ? 'Finalizar' : 'Siguiente ejercicio'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}