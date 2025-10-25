import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
  title: string
  description: string
  progress?: number
  level?: string
}

export default function CourseCard({ title, description, progress = 0, level }: CourseCardProps) {
  return (
    <Card className="exercise-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {level && (
            <span className={`level-badge level-${level.toLowerCase()}`}>
              {level}
            </span>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{progress}% Complete</span>
            <Button size="sm">Continue</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}