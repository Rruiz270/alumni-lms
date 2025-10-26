import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';

export interface WelcomeTemplateProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  language: 'en' | 'es';
  dashboardUrl: string;
  supportEmail: string;
}

export class WelcomeTemplate extends BaseTemplate implements EmailTemplate {
  render(data: WelcomeTemplateProps): string {
    const { user, language, dashboardUrl, supportEmail } = data;
    
    const texts = {
      en: {
        title: 'Welcome to Alumni by Better!',
        preheader: 'Start your Spanish learning journey today',
        greeting: `Hello ${user.name}!`,
        welcome: 'Welcome to Alumni by Better',
        subtitle: 'Your Spanish learning journey starts now',
        intro: `We're excited to have you join our community of learners! Alumni by Better connects alumni through personalized Spanish learning experiences.`,
        whatNext: 'What\'s next?',
        steps: [
          'Complete your profile setup',
          'Take our placement test to determine your level',
          'Browse available topics and book your first class',
          'Meet your teachers and start learning!'
        ],
        getStarted: 'Get Started',
        features: 'What you\'ll love about Alumni by Better:',
        featureList: [
          '🎯 Personalized learning paths based on your level',
          '👨‍🏫 Expert native Spanish teachers',
          '📅 Flexible scheduling that fits your lifestyle',
          '🏆 Progress tracking and certificates',
          '💬 Interactive live classes via Google Meet',
          '📚 Comprehensive learning materials'
        ],
        support: `If you have any questions, don't hesitate to reach out to our support team at ${supportEmail}. We're here to help!`,
        closing: 'Welcome aboard and happy learning!',
        team: 'The Alumni by Better Team'
      },
      es: {
        title: '¡Bienvenido a Alumni by Better!',
        preheader: 'Comienza tu viaje de aprendizaje de español hoy',
        greeting: `¡Hola ${user.name}!`,
        welcome: 'Bienvenido a Alumni by Better',
        subtitle: 'Tu viaje de aprendizaje de español comienza ahora',
        intro: `¡Estamos emocionados de tenerte en nuestra comunidad de estudiantes! Alumni by Better conecta alumni a través de experiencias de aprendizaje de español personalizadas.`,
        whatNext: '¿Qué sigue?',
        steps: [
          'Completa la configuración de tu perfil',
          'Realiza nuestro examen de ubicación para determinar tu nivel',
          'Explora los temas disponibles y reserva tu primera clase',
          '¡Conoce a tus profesores y comienza a aprender!'
        ],
        getStarted: 'Comenzar',
        features: 'Lo que te encantará de Alumni by Better:',
        featureList: [
          '🎯 Rutas de aprendizaje personalizadas según tu nivel',
          '👨‍🏫 Profesores nativos expertos en español',
          '📅 Horarios flexibles que se adaptan a tu estilo de vida',
          '🏆 Seguimiento del progreso y certificados',
          '💬 Clases interactivas en vivo vía Google Meet',
          '📚 Materiales de aprendizaje integrales'
        ],
        support: `Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte en ${supportEmail}. ¡Estamos aquí para ayudarte!`,
        closing: '¡Bienvenido a bordo y feliz aprendizaje!',
        team: 'El Equipo de Alumni by Better'
      }
    };

    const t = texts[language];

    const content = `
      <h2>${this.getEmoji('welcome')} ${t.greeting}</h2>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🎓</span>
          <h3 class="card-title">${t.welcome}</h3>
        </div>
        <p style="font-size: 18px; color: #4f46e5; font-weight: 600; margin: 0;">${t.subtitle}</p>
      </div>
      
      <p>${t.intro}</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" class="button">${t.getStarted}</a>
      </div>
      
      <div class="card">
        <h3>${t.whatNext}</h3>
        <ol>
          ${t.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
      
      <h3>${t.features}</h3>
      <ul>
        ${t.featureList.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      
      <div class="alert alert-info">
        <p><strong>💡 Pro tip:</strong> ${language === 'es' ? 
          'Para aprovechar al máximo tu experiencia, recomendamos tomar al menos 2-3 clases por semana.' : 
          'To get the most out of your experience, we recommend taking at least 2-3 classes per week.'
        }</p>
      </div>
      
      <p>${t.support}</p>
      
      <p>${t.closing}</p>
      <p><strong>${t.team}</strong></p>
    `;

    return this.getBaseTemplate({
      title: t.title,
      preheader: t.preheader,
      language,
      content,
      footerContent: `
        <div class="alert alert-success" style="background-color: rgba(5, 150, 105, 0.1); color: #047857; text-align: center;">
          <p style="margin: 0;"><strong>${language === 'es' ? 
            '🚀 ¡Tu cuenta está lista! Inicia sesión para comenzar.' : 
            '🚀 Your account is ready! Log in to get started.'
          }</strong></p>
        </div>
      `
    });
  }

  getSubject(language: 'en' | 'es'): string {
    return language === 'es' 
      ? '🎉 ¡Bienvenido a Alumni by Better! Tu viaje de aprendizaje comienza aquí'
      : '🎉 Welcome to Alumni by Better! Your learning journey starts here';
  }
}