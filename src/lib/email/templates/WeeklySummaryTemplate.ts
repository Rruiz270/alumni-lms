import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export interface WeeklySummaryTemplateProps {
  teacher: {
    name: string;
    email: string;
  };
  weeklyData: {
    totalClasses: number;
    totalStudents: number;
    upcomingClasses: Array<{
      id: string;
      scheduledAt: Date;
      student: {
        name: string;
        email: string;
      };
      topic: {
        name: string;
        level: string;
      };
    }>;
    studentProgress: Array<{
      student: {
        name: string;
        email: string;
      };
      progress: number;
      lastActivity: Date;
    }>;
  };
  language: 'en' | 'es';
  dashboardUrl: string;
}

export class WeeklySummaryTemplate extends BaseTemplate implements EmailTemplate {
  render(data: WeeklySummaryTemplateProps): string {
    const { teacher, weeklyData, language, dashboardUrl } = data;
    const locale = language === 'es' ? es : enUS;

    const texts = {
      en: {
        title: 'Weekly Teaching Summary',
        preheader: 'Your weekly teaching report and upcoming classes',
        greeting: `Hello ${teacher.name}!`,
        subtitle: 'Your Teaching Summary for This Week',
        intro: 'Here\'s a summary of your teaching activities and what\'s coming up next week.',
        weeklyStats: 'This Week\'s Statistics',
        classesCompleted: 'Classes Completed',
        studentsHelped: 'Students Helped',
        upcomingClasses: 'Upcoming Classes',
        studentProgress: 'Student Progress Updates',
        noUpcoming: 'No upcoming classes scheduled',
        scheduleMore: 'Students are looking for classes! Check your availability.',
        progressNote: 'Students are showing great progress under your guidance',
        viewSchedule: 'View Full Schedule',
        updateAvailability: 'Update Availability',
        tips: 'Teaching Tips for Next Week',
        tipsList: [
          '📚 Prepare engaging activities for different proficiency levels',
          '🎯 Set clear learning objectives for each session',
          '💬 Encourage students to practice speaking as much as possible',
          '📝 Provide constructive feedback on exercises',
          '🕒 Always join classes a few minutes early to prepare'
        ],
        keepTeaching: 'Keep Up the Great Work!',
        appreciation: 'Thank you for being an amazing teacher',
        impact: 'Your dedication is making a real difference in your students\' learning journey.',
        level: 'Level',
        lastSeen: 'Last Activity',
        progress: 'Progress',
        timeFormat: 'MMM do, h:mm a',
        dateFormat: 'MMM do'
      },
      es: {
        title: 'Resumen Semanal de Enseñanza',
        preheader: 'Tu reporte semanal de enseñanza y próximas clases',
        greeting: `¡Hola ${teacher.name}!`,
        subtitle: 'Tu Resumen de Enseñanza de Esta Semana',
        intro: 'Aquí tienes un resumen de tus actividades de enseñanza y lo que viene la próxima semana.',
        weeklyStats: 'Estadísticas de Esta Semana',
        classesCompleted: 'Clases Completadas',
        studentsHelped: 'Estudiantes Ayudados',
        upcomingClasses: 'Próximas Clases',
        studentProgress: 'Actualizaciones de Progreso de Estudiantes',
        noUpcoming: 'No hay clases próximas programadas',
        scheduleMore: '¡Los estudiantes están buscando clases! Revisa tu disponibilidad.',
        progressNote: 'Los estudiantes están mostrando gran progreso bajo tu guía',
        viewSchedule: 'Ver Horario Completo',
        updateAvailability: 'Actualizar Disponibilidad',
        tips: 'Consejos de Enseñanza para la Próxima Semana',
        tipsList: [
          '📚 Prepara actividades atractivas para diferentes niveles de competencia',
          '🎯 Establece objetivos de aprendizaje claros para cada sesión',
          '💬 Anima a los estudiantes a practicar hablar tanto como sea posible',
          '📝 Proporciona retroalimentación constructiva sobre los ejercicios',
          '🕒 Siempre únete a las clases unos minutos antes para prepararte'
        ],
        keepTeaching: '¡Sigue con el Excelente Trabajo!',
        appreciation: 'Gracias por ser un profesor increíble',
        impact: 'Tu dedicación está haciendo una diferencia real en el viaje de aprendizaje de tus estudiantes.',
        level: 'Nivel',
        lastSeen: 'Última Actividad',
        progress: 'Progreso',
        timeFormat: 'do \'de\' MMM, HH:mm',
        dateFormat: 'do \'de\' MMM'
      }
    };

    const t = texts[language];

    const content = `
      <h2>${this.getEmoji('summary')} ${t.greeting}</h2>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🎓</span>
          <h3 class="card-title">${t.subtitle}</h3>
        </div>
        <p>${t.intro}</p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📊</span>
          <h3 class="card-title">${t.weeklyStats}</h3>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <p class="stat-number">${weeklyData.totalClasses}</p>
            <p class="stat-label">${t.classesCompleted}</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">${weeklyData.totalStudents}</p>
            <p class="stat-label">${t.studentsHelped}</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">${weeklyData.upcomingClasses.length}</p>
            <p class="stat-label">${t.upcomingClasses}</p>
          </div>
        </div>
        
        ${weeklyData.totalClasses > 0 ? `
        <div class="alert alert-success">
          <p style="margin: 0;"><strong>🎉 ${t.appreciation}!</strong> ${t.impact}</p>
        </div>
        ` : ''}
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📅</span>
          <h3 class="card-title">${t.upcomingClasses}</h3>
        </div>
        
        ${weeklyData.upcomingClasses.length > 0 ? `
          <div style="max-height: 400px; overflow-y: auto;">
            ${weeklyData.upcomingClasses.slice(0, 10).map(classItem => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; margin: 8px 0; background-color: #f8fafc;">
                <div style="flex: 1;">
                  <p style="margin: 0; font-weight: 600; color: #374151;">${classItem.topic.name}</p>
                  <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                    👤 ${classItem.student.name} • 📈 ${classItem.topic.level}
                  </p>
                  <p style="margin: 4px 0 0 0; color: #4f46e5; font-weight: 500; font-size: 14px;">
                    📅 ${format(classItem.scheduledAt, t.timeFormat, { locale })}
                  </p>
                </div>
                <div style="text-align: right;">
                  <div style="padding: 4px 8px; background-color: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 600;">
                    ${format(classItem.scheduledAt, t.dateFormat, { locale })}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="alert alert-info">
            <p style="margin: 0;"><strong>📅</strong> ${t.noUpcoming}</p>
            <p style="margin: 8px 0 0 0;">${t.scheduleMore}</p>
          </div>
        `}
      </div>
      
      ${weeklyData.studentProgress.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📈</span>
          <h3 class="card-title">${t.studentProgress}</h3>
        </div>
        
        <p style="color: #047857; font-weight: 500; margin: 0 0 16px 0;">✨ ${t.progressNote}</p>
        
        <div style="max-height: 300px; overflow-y: auto;">
          ${weeklyData.studentProgress.slice(0, 8).map(studentData => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; color: #374151;">${studentData.student.name}</p>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                  ${t.lastSeen}: ${format(studentData.lastActivity, t.dateFormat, { locale })}
                </p>
              </div>
              <div style="text-align: right;">
                <div style="width: 60px; height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 0 0 4px 0;">
                  <div style="width: ${studentData.progress}%; height: 100%; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);"></div>
                </div>
                <div style="font-size: 12px; color: #4f46e5; font-weight: 600;">${studentData.progress}%</div>
              </div>
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
          <h3 class="card-title">${t.keepTeaching}</h3>
        </div>
        
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button" style="margin: 8px;">${t.viewSchedule}</a>
          <a href="${process.env.NEXTAUTH_URL}/teacher/availability" class="button button-secondary" style="margin: 8px;">${t.updateAvailability}</a>
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: white;">${language === 'es' ? '¡Gracias por tu dedicación!' : 'Thank you for your dedication!'}</h3>
        <p style="margin: 0; opacity: 0.9;">${language === 'es' ? 
          'Tus estudiantes aprecian tu tiempo y esfuerzo. ¡Sigue inspirándolos!' : 
          'Your students appreciate your time and effort. Keep inspiring them!'
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
      ? '📋 Tu Resumen Semanal de Enseñanza - Próximas clases y progreso'
      : '📋 Your Weekly Teaching Summary - Upcoming classes and progress';
  }
}