import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export interface CourseCompletionTemplateProps {
  user: {
    name: string;
    email: string;
  };
  courseData: {
    courseName: string;
    level: string;
    completedAt: Date;
    certificateUrl: string;
  };
  language: 'en' | 'es';
  dashboardUrl: string;
}

export class CourseCompletionTemplate extends BaseTemplate implements EmailTemplate {
  render(data: CourseCompletionTemplateProps): string {
    const { user, courseData, language, dashboardUrl } = data;
    const locale = language === 'es' ? es : enUS;

    const texts = {
      en: {
        title: 'Congratulations! Course Completed',
        preheader: `You've successfully completed ${courseData.courseName}`,
        greeting: `Congratulations ${user.name}!`,
        celebration: 'You\'ve Successfully Completed Your Course!',
        subtitle: 'A major milestone in your Spanish learning journey',
        intro: `We're thrilled to celebrate this incredible achievement with you. You have successfully completed the ${courseData.courseName} course!`,
        courseDetails: 'Course Completion Details',
        courseName: 'Course',
        level: 'Level',
        completedDate: 'Completed On',
        certificate: 'Your Certificate',
        certificateDesc: 'Download your official completion certificate to showcase your achievement.',
        downloadCert: 'Download Certificate',
        whatNext: 'What\'s Next?',
        nextSteps: [
          '🎯 Continue to the next level to advance your Spanish skills',
          '📚 Review and practice what you\'ve learned to reinforce knowledge',
          '🗣️ Join conversation practice sessions to apply your skills',
          '🏆 Share your achievement on social media and LinkedIn',
          '📖 Explore specialized courses in areas that interest you'
        ],
        achievements: 'Your Achievements',
        achievementsList: [
          '✅ Mastered fundamental Spanish concepts',
          '💬 Improved conversational abilities',
          '📝 Enhanced reading and writing skills',
          '🎯 Completed all course exercises and assessments',
          '🏆 Earned your official completion certificate'
        ],
        stats: 'Course Statistics',
        keepLearning: 'Keep Learning!',
        exploreMore: 'Explore More Courses',
        viewCertificates: 'View All Certificates',
        sharing: 'Share Your Success',
        shareText: 'Don\'t forget to share this milestone with your network!',
        socialMedia: 'Share on social media',
        dateFormat: 'MMMM do, yyyy',
        timeFormat: 'h:mm a',
        congratsNote: 'This is just the beginning of your Spanish learning adventure!',
        motivation: 'Your dedication and hard work have paid off. Keep up the excellent momentum!'
      },
      es: {
        title: '¡Felicitaciones! Curso Completado',
        preheader: `Has completado exitosamente ${courseData.courseName}`,
        greeting: `¡Felicitaciones ${user.name}!`,
        celebration: '¡Has Completado Exitosamente tu Curso!',
        subtitle: 'Un hito importante en tu viaje de aprendizaje de español',
        intro: `Estamos emocionados de celebrar este increíble logro contigo. ¡Has completado exitosamente el curso ${courseData.courseName}!`,
        courseDetails: 'Detalles de Finalización del Curso',
        courseName: 'Curso',
        level: 'Nivel',
        completedDate: 'Completado el',
        certificate: 'Tu Certificado',
        certificateDesc: 'Descarga tu certificado oficial de finalización para mostrar tu logro.',
        downloadCert: 'Descargar Certificado',
        whatNext: '¿Qué Sigue?',
        nextSteps: [
          '🎯 Continúa al siguiente nivel para avanzar tus habilidades en español',
          '📚 Repasa y practica lo que has aprendido para reforzar el conocimiento',
          '🗣️ Únete a sesiones de práctica de conversación para aplicar tus habilidades',
          '🏆 Comparte tu logro en redes sociales y LinkedIn',
          '📖 Explora cursos especializados en áreas que te interesen'
        ],
        achievements: 'Tus Logros',
        achievementsList: [
          '✅ Dominaste conceptos fundamentales del español',
          '💬 Mejoraste las habilidades conversacionales',
          '📝 Fortaleciste las habilidades de lectura y escritura',
          '🎯 Completaste todos los ejercicios y evaluaciones del curso',
          '🏆 Obtuviste tu certificado oficial de finalización'
        ],
        stats: 'Estadísticas del Curso',
        keepLearning: '¡Sigue Aprendiendo!',
        exploreMore: 'Explorar Más Cursos',
        viewCertificates: 'Ver Todos los Certificados',
        sharing: 'Comparte tu Éxito',
        shareText: '¡No olvides compartir este hito con tu red!',
        socialMedia: 'Compartir en redes sociales',
        dateFormat: 'do \'de\' MMMM \'de\' yyyy',
        timeFormat: 'HH:mm',
        congratsNote: '¡Este es solo el comienzo de tu aventura de aprendizaje de español!',
        motivation: 'Tu dedicación y trabajo duro han dado frutos. ¡Mantén el excelente impulso!'
      }
    };

    const t = texts[language];

    const content = `
      <h2>${this.getEmoji('certificate')} ${t.greeting}</h2>
      
      <div style="text-align: center; margin: 32px 0; padding: 32px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);">
        <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
        <h2 style="margin: 0 0 8px 0; color: white; font-size: 28px;">${t.celebration}</h2>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">${t.subtitle}</p>
      </div>
      
      <p style="font-size: 18px; line-height: 1.6;">${t.intro}</p>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📚</span>
          <h3 class="card-title">${t.courseDetails}</h3>
        </div>
        
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 24px; border-radius: 8px; margin: 16px 0;">
          <div style="display: flex; gap: 24px; align-items: center;">
            <div style="flex: 1;">
              <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">${t.courseName}</p>
              <h3 style="margin: 0 0 8px 0; color: white; font-size: 22px;">${courseData.courseName}</h3>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">${t.level}: ${courseData.level}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 4px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">${t.completedDate}</p>
              <p style="margin: 0; color: white; font-size: 16px; font-weight: 600;">
                ${format(courseData.completedAt, t.dateFormat, { locale })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🏅</span>
          <h3 class="card-title">${t.certificate}</h3>
        </div>
        
        <div style="text-align: center; padding: 24px; background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin: 16px 0;">
          <div style="font-size: 64px; margin-bottom: 16px;">📜</div>
          <p style="margin: 0 0 16px 0; color: #92400e; font-size: 16px;">${t.certificateDesc}</p>
          <a href="${courseData.certificateUrl}" class="button button-warning" style="font-size: 18px; padding: 16px 32px;">
            🏆 ${t.downloadCert}
          </a>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">✨</span>
          <h3 class="card-title">${t.achievements}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${t.achievementsList.map(achievement => `<li style="margin: 12px 0; line-height: 1.5; font-size: 16px;">${achievement}</li>`).join('')}
        </ul>
        
        <div class="alert alert-success" style="margin-top: 20px;">
          <p style="margin: 0; text-align: center;"><strong>🎉</strong> ${t.motivation}</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🚀</span>
          <h3 class="card-title">${t.whatNext}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${t.nextSteps.map(step => `<li style="margin: 12px 0; line-height: 1.5;">${step}</li>`).join('')}
        </ul>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📱</span>
          <h3 class="card-title">${t.sharing}</h3>
        </div>
        
        <p>${t.shareText}</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; padding: 16px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #0c4a6e;">${language === 'es' ? 'Texto sugerido para compartir:' : 'Suggested sharing text:'}</p>
            <p style="margin: 0; font-style: italic; color: #0369a1; font-size: 14px;">
              "${language === 'es' ? 
                `¡Acabo de completar el curso ${courseData.courseName} (${courseData.level}) en Alumni by Better! 🎉🇪🇸 #SpanishLearning #Alumni` :
                `Just completed the ${courseData.courseName} course (${courseData.level}) at Alumni by Better! 🎉🇪🇸 #SpanishLearning #Alumni`
              }"
            </p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📖</span>
          <h3 class="card-title">${t.keepLearning}</h3>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/courses" class="button" style="margin: 8px;">${t.exploreMore}</a>
          <a href="${dashboardUrl}" class="button button-secondary" style="margin: 8px;">${t.viewCertificates}</a>
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border-radius: 8px;">
        <div style="font-size: 32px; margin-bottom: 12px;">🎓</div>
        <h3 style="margin: 0 0 8px 0; color: white;">${language === 'es' ? '¡Felicitaciones una vez más!' : 'Congratulations once again!'}</h3>
        <p style="margin: 0; opacity: 0.9; font-size: 16px;">${t.congratsNote}</p>
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
      ? '🏆 ¡Felicitaciones! Has completado tu curso - Descarga tu certificado'
      : '🏆 Congratulations! You\'ve completed your course - Download your certificate';
  }
}