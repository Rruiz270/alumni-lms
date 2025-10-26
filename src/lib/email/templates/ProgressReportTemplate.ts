import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export interface ProgressReportTemplateProps {
  progressData: {
    student: {
      name: string;
      email: string;
      level?: string;
    };
    completedTopics: number;
    totalTopics: number;
    currentLevel: string;
    recentActivities: Array<{
      type: string;
      topic: string;
      completedAt: Date;
      score?: number;
    }>;
    weeklyStats: {
      classesAttended: number;
      exercisesCompleted: number;
      studyTime: number; // in minutes
    };
  };
  language: 'en' | 'es';
  dashboardUrl: string;
}

export class ProgressReportTemplate extends BaseTemplate implements EmailTemplate {
  render(data: ProgressReportTemplateProps): string {
    const { progressData, language, dashboardUrl } = data;
    const { student, completedTopics, totalTopics, currentLevel, recentActivities, weeklyStats } = progressData;
    const locale = language === 'es' ? es : enUS;
    const progressPercentage = Math.round((completedTopics / totalTopics) * 100);

    const texts = {
      en: {
        title: 'Your Weekly Progress Report',
        preheader: 'See how you\'re advancing in your Spanish learning journey',
        greeting: `Hello ${student.name}!`,
        subtitle: 'Your Spanish Learning Progress Report',
        intro: 'Here\'s a summary of your learning progress this week. Keep up the great work!',
        overallProgress: 'Overall Progress',
        currentLevel: 'Current Level',
        topicsCompleted: 'Topics Completed',
        weeklyStats: 'This Week\'s Statistics',
        classesAttended: 'Classes Attended',
        exercisesCompleted: 'Exercises Completed',
        studyTime: 'Study Time',
        recentActivities: 'Recent Activities',
        keepLearning: 'Keep Learning!',
        scheduleClass: 'Schedule Your Next Class',
        viewProgress: 'View Full Progress',
        congratulations: 'Congratulations!',
        encouragement: 'You\'re making excellent progress in your Spanish learning journey!',
        tips: 'Learning Tips',
        tipsList: [
          '🎯 Practice consistently - even 15 minutes daily makes a difference',
          '📚 Review previous topics to reinforce your learning',
          '💬 Try to use new vocabulary in conversations',
          '🎵 Listen to Spanish music or podcasts in your free time',
          '📝 Keep a learning journal to track new words and phrases'
        ],
        activityTypes: {
          'live_class': 'Live Class',
          'exercise': 'Exercise',
          'quiz': 'Quiz',
          'homework': 'Homework'
        },
        minutes: 'minutes',
        hours: 'hours',
        great: 'Great!',
        excellent: 'Excellent!',
        outstanding: 'Outstanding!',
        timeFormat: 'MMM do'
      },
      es: {
        title: 'Tu Reporte de Progreso Semanal',
        preheader: 'Ve cómo estás avanzando en tu viaje de aprendizaje de español',
        greeting: `¡Hola ${student.name}!`,
        subtitle: 'Tu Reporte de Progreso en Español',
        intro: 'Aquí tienes un resumen de tu progreso de aprendizaje esta semana. ¡Sigue con el excelente trabajo!',
        overallProgress: 'Progreso General',
        currentLevel: 'Nivel Actual',
        topicsCompleted: 'Temas Completados',
        weeklyStats: 'Estadísticas de Esta Semana',
        classesAttended: 'Clases Asistidas',
        exercisesCompleted: 'Ejercicios Completados',
        studyTime: 'Tiempo de Estudio',
        recentActivities: 'Actividades Recientes',
        keepLearning: '¡Sigue Aprendiendo!',
        scheduleClass: 'Programa tu Próxima Clase',
        viewProgress: 'Ver Progreso Completo',
        congratulations: '¡Felicitaciones!',
        encouragement: '¡Estás haciendo un excelente progreso en tu viaje de aprendizaje de español!',
        tips: 'Consejos de Aprendizaje',
        tipsList: [
          '🎯 Practica consistentemente - incluso 15 minutos diarios hace la diferencia',
          '📚 Repasa temas anteriores para reforzar tu aprendizaje',
          '💬 Trata de usar nuevo vocabulario en conversaciones',
          '🎵 Escucha música o podcasts en español en tu tiempo libre',
          '📝 Mantén un diario de aprendizaje para rastrear nuevas palabras y frases'
        ],
        activityTypes: {
          'live_class': 'Clase en Vivo',
          'exercise': 'Ejercicio',
          'quiz': 'Quiz',
          'homework': 'Tarea'
        },
        minutes: 'minutos',
        hours: 'horas',
        great: '¡Genial!',
        excellent: '¡Excelente!',
        outstanding: '¡Sobresaliente!',
        timeFormat: 'do \'de\' MMM'
      }
    };

    const t = texts[language];

    // Get encouragement message based on progress
    let encouragementLevel = t.great;
    if (progressPercentage >= 80) encouragementLevel = t.outstanding;
    else if (progressPercentage >= 60) encouragementLevel = t.excellent;

    // Format study time
    const studyHours = Math.floor(weeklyStats.studyTime / 60);
    const studyMinutes = weeklyStats.studyTime % 60;
    const studyTimeFormatted = studyHours > 0 
      ? `${studyHours}h ${studyMinutes}m`
      : `${studyMinutes} ${t.minutes}`;

    const content = `
      <h2>${this.getEmoji('progress')} ${t.greeting}</h2>
      
      <div class="alert alert-success">
        <h3 style="margin: 0 0 8px 0; color: #047857;">${t.congratulations}</h3>
        <p style="margin: 0; color: #047857;">${t.encouragement}</p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📊</span>
          <h3 class="card-title">${t.overallProgress}</h3>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <div style="position: relative; width: 120px; height: 120px; margin: 0 auto; background: conic-gradient(#4f46e5 0deg ${progressPercentage * 3.6}deg, #e5e7eb ${progressPercentage * 3.6}deg 360deg); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
              <div style="font-size: 24px; font-weight: bold; color: #4f46e5;">${progressPercentage}%</div>
              <div style="font-size: 12px; color: #6b7280;">${t.currentLevel}</div>
            </div>
          </div>
          <p style="margin: 16px 0 0 0; font-size: 18px; color: #4f46e5; font-weight: 600;">${currentLevel}</p>
        </div>
        
        <div style="display: flex; justify-content: center; margin: 20px 0;">
          <div style="text-align: center; padding: 12px 20px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px;">
            <div style="font-size: 20px; font-weight: bold; color: #0c4a6e;">${completedTopics}/${totalTopics}</div>
            <div style="font-size: 14px; color: #0369a1;">${t.topicsCompleted}</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📈</span>
          <h3 class="card-title">${t.weeklyStats}</h3>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <p class="stat-number">${weeklyStats.classesAttended}</p>
            <p class="stat-label">${t.classesAttended}</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">${weeklyStats.exercisesCompleted}</p>
            <p class="stat-label">${t.exercisesCompleted}</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">${studyTimeFormatted}</p>
            <p class="stat-label">${t.studyTime}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 16px 0; padding: 12px; background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px;">
          <p style="margin: 0; color: #047857; font-weight: 600;">${encouragementLevel} ${language === 'es' ? 'Mantén el ritmo.' : 'Keep up the pace!'}</p>
        </div>
      </div>
      
      ${recentActivities.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🕒</span>
          <h3 class="card-title">${t.recentActivities}</h3>
        </div>
        
        <div style="max-height: 300px; overflow-y: auto;">
          ${recentActivities.slice(0, 5).map(activity => `
            <div style="display: flex; justify-content: between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb; last-child:border-bottom: none;">
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; color: #374151;">${activity.topic}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">
                  ${t.activityTypes[activity.type as keyof typeof t.activityTypes] || activity.type} • 
                  ${format(activity.completedAt, t.timeFormat, { locale })}
                </p>
              </div>
              ${activity.score !== undefined ? `
              <div style="text-align: right;">
                <div style="padding: 4px 8px; background-color: ${activity.score >= 80 ? '#dcfce7' : activity.score >= 60 ? '#fef3c7' : '#fef2f2'}; color: ${activity.score >= 80 ? '#166534' : activity.score >= 60 ? '#92400e' : '#991b1b'}; border-radius: 4px; font-size: 12px; font-weight: 600;">
                  ${activity.score}%
                </div>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">💡</span>
          <h3 class="card-title">${t.tips}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${t.tipsList.map(tip => `<li style="margin: 12px 0; line-height: 1.5;">${tip}</li>`).join('')}
        </ul>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🚀</span>
          <h3 class="card-title">${t.keepLearning}</h3>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/schedule" class="button" style="margin: 8px;">${t.scheduleClass}</a>
          <a href="${dashboardUrl}" class="button button-secondary" style="margin: 8px;">${t.viewProgress}</a>
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: white;">${language === 'es' ? '¡Sigue así!' : 'Keep it up!'}</h3>
        <p style="margin: 0; opacity: 0.9;">${language === 'es' ? 
          'Tu dedicación está dando frutos. ¡Nos vemos en la próxima clase!' : 
          'Your dedication is paying off. See you in the next class!'
        }</p>
      </div>
    `;

    return this.getBaseTemplate({
      title: t.title,
      preheader: t.preheader,
      language,
      content,
    });
  }

  getSubject(language: 'en' | 'es'): string {
    return language === 'es'
      ? '📊 Tu Progreso Semanal - ¡Mira cuánto has avanzado!'
      : '📊 Your Weekly Progress - See how much you\'ve advanced!';
  }
}