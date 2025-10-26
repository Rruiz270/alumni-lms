import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';

export interface EngagementTemplateProps {
  user: {
    name: string;
    email: string;
    level?: string;
  };
  inactiveDays: number;
  suggestions: string[];
  language: 'en' | 'es';
  dashboardUrl: string;
  scheduleUrl: string;
}

export class EngagementTemplate extends BaseTemplate implements EmailTemplate {
  render(data: EngagementTemplateProps): string {
    const { user, inactiveDays, suggestions, language, dashboardUrl, scheduleUrl } = data;

    const texts = {
      en: {
        title: 'We Miss You!',
        preheader: 'Continue your Spanish learning journey with us',
        greeting: `Hello ${user.name},`,
        missYou: 'We Miss You!',
        subtitle: 'Your Spanish learning journey is waiting for you',
        intro: `It's been ${inactiveDays} days since your last visit to Alumni by Better. We hope you're doing well!`,
        reminder: 'Your Spanish skills are waiting to be developed further, and we\'re here to help you continue your learning journey.',
        whatWaiting: 'What\'s Waiting for You',
        benefits: [
          '🎯 Personalized lessons at your current level',
          '👨‍🏫 Expert native Spanish teachers ready to help',
          '📚 New learning materials and topics',
          '💬 Interactive conversation practice',
          '🏆 Track your progress and earn certificates'
        ],
        suggestions: 'Suggestions for You',
        comeBack: 'Ready to Come Back?',
        scheduleClass: 'Schedule a Class',
        browseTopics: 'Browse Topics',
        viewProgress: 'View Your Progress',
        motivation: 'Motivational Quote',
        quote: '"Every expert was once a beginner. Every pro was once an amateur."',
        quoteAuthor: '- Robin Sharma',
        encouragement: 'Don\'t let your progress fade away. Even 15 minutes of practice can make a difference!',
        specialOffer: 'Special Welcome Back Offer',
        offerText: 'As a welcome back gesture, your next class booking comes with extra preparation materials!',
        help: 'Need help getting back on track? Our support team is here to assist you.',
        closing: 'We believe in your potential and can\'t wait to see you succeed!',
        team: 'The Alumni by Better Team'
      },
      es: {
        title: '¡Te Extrañamos!',
        preheader: 'Continúa tu viaje de aprendizaje de español con nosotros',
        greeting: `Hola ${user.name},`,
        missYou: '¡Te Extrañamos!',
        subtitle: 'Tu viaje de aprendizaje de español te está esperando',
        intro: `Han pasado ${inactiveDays} días desde tu última visita a Alumni by Better. ¡Esperamos que estés bien!`,
        reminder: 'Tus habilidades en español están esperando ser desarrolladas aún más, y estamos aquí para ayudarte a continuar tu viaje de aprendizaje.',
        whatWaiting: 'Lo que te Está Esperando',
        benefits: [
          '🎯 Lecciones personalizadas en tu nivel actual',
          '👨‍🏫 Profesores nativos expertos en español listos para ayudar',
          '📚 Nuevos materiales de aprendizaje y temas',
          '💬 Práctica de conversación interactiva',
          '🏆 Rastrea tu progreso y gana certificados'
        ],
        suggestions: 'Sugerencias para Ti',
        comeBack: '¿Listo para Volver?',
        scheduleClass: 'Programar una Clase',
        browseTopics: 'Explorar Temas',
        viewProgress: 'Ver tu Progreso',
        motivation: 'Cita Motivacional',
        quote: '"Todo experto fue una vez principiante. Todo profesional fue una vez amateur."',
        quoteAuthor: '- Robin Sharma',
        encouragement: '¡No dejes que tu progreso se desvanezca. Incluso 15 minutos de práctica pueden hacer la diferencia!',
        specialOffer: 'Oferta Especial de Bienvenida',
        offerText: '¡Como gesto de bienvenida de vuelta, tu próxima reserva de clase viene con materiales de preparación extra!',
        help: '¿Necesitas ayuda para retomar el camino? Nuestro equipo de soporte está aquí para asistirte.',
        closing: '¡Creemos en tu potencial y no podemos esperar a verte triunfar!',
        team: 'El Equipo de Alumni by Better'
      }
    };

    const t = texts[language];

    // Determine message tone based on inactivity period
    let urgencyLevel = 'gentle';
    if (inactiveDays > 30) urgencyLevel = 'moderate';
    if (inactiveDays > 60) urgencyLevel = 'strong';

    const content = `
      <h2>${this.getEmoji('engagement')} ${t.greeting}</h2>
      
      <div style="text-align: center; margin: 32px 0; padding: 32px; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; border-radius: 12px;">
        <div style="font-size: 48px; margin-bottom: 16px;">💙</div>
        <h2 style="margin: 0 0 8px 0; color: white; font-size: 28px;">${t.missYou}</h2>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">${t.subtitle}</p>
      </div>
      
      <p style="font-size: 18px; line-height: 1.6;">${t.intro}</p>
      <p>${t.reminder}</p>
      
      ${inactiveDays > 30 ? `
      <div class="alert alert-warning">
        <p style="margin: 0;"><strong>⚠️ ${language === 'es' ? 'Recordatorio importante' : 'Important reminder'}:</strong> 
        ${language === 'es' ? 
          'Las habilidades lingüísticas necesitan práctica regular para mantenerse afiladas. ¡No dejes que tu progreso se desvanezca!' : 
          'Language skills need regular practice to stay sharp. Don\'t let your progress fade away!'
        }</p>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">✨</span>
          <h3 class="card-title">${t.whatWaiting}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${t.benefits.map(benefit => `<li style="margin: 12px 0; line-height: 1.5; font-size: 16px;">${benefit}</li>`).join('')}
        </ul>
      </div>
      
      ${suggestions.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">💡</span>
          <h3 class="card-title">${t.suggestions}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${suggestions.map(suggestion => `<li style="margin: 12px 0; line-height: 1.5;">${suggestion}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🎯</span>
          <h3 class="card-title">${t.motivation}</h3>
        </div>
        
        <div style="text-align: center; padding: 24px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 18px; font-style: italic; color: #4f46e5;">${t.quote}</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">${t.quoteAuthor}</p>
        </div>
        
        <div class="alert alert-info">
          <p style="margin: 0;"><strong>💪</strong> ${t.encouragement}</p>
        </div>
      </div>
      
      ${urgencyLevel !== 'strong' ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🎁</span>
          <h3 class="card-title">${t.specialOffer}</h3>
        </div>
        
        <div class="alert alert-success">
          <p style="margin: 0;"><strong>🎉</strong> ${t.offerText}</p>
        </div>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🚀</span>
          <h3 class="card-title">${t.comeBack}</h3>
        </div>
        
        <div style="text-align: center;">
          <a href="${scheduleUrl}" class="button" style="margin: 8px; font-size: 18px; padding: 16px 32px;">
            📅 ${t.scheduleClass}
          </a>
          <br>
          <a href="${process.env.NEXTAUTH_URL}/topics" class="button button-secondary" style="margin: 8px;">${t.browseTopics}</a>
          <a href="${dashboardUrl}" class="button button-secondary" style="margin: 8px;">${t.viewProgress}</a>
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 20px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #0c4a6e; font-weight: 600;">${t.help}</p>
        <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@alumni-better.com'}" style="color: #0369a1; text-decoration: underline;">
          ${process.env.SUPPORT_EMAIL || 'support@alumni-better.com'}
        </a>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border-radius: 8px;">
        <div style="font-size: 32px; margin-bottom: 12px;">🌟</div>
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${t.closing}</p>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">${t.team}</p>
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
      ? '💙 ¡Te extrañamos! Tu viaje de español continúa aquí'
      : '💙 We miss you! Your Spanish journey continues here';
  }
}