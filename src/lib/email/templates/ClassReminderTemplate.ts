import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export interface ClassReminderTemplateProps {
  booking: {
    id: string;
    scheduledAt: Date;
    duration: number;
    googleMeetLink: string | null;
    student: {
      name: string;
      email: string;
    };
    teacher: {
      name: string;
      email: string;
    };
    topic: {
      name: string;
      level: string;
      description?: string | null;
      tema?: string | null;
      vocabulario?: string | null;
    };
  };
  reminderType: '24h' | '1h';
  recipient: 'student' | 'teacher';
  language: 'en' | 'es';
}

export class ClassReminderTemplate extends BaseTemplate implements EmailTemplate {
  render(data: ClassReminderTemplateProps): string {
    const { booking, reminderType, recipient, language } = data;
    const isStudent = recipient === 'student';
    const locale = language === 'es' ? es : enUS;
    const timeLabel = reminderType === '24h' ? '24 horas' : '1 hora';

    const texts = {
      en: {
        title: `Class Reminder - ${reminderType === '24h' ? '24 Hours' : '1 Hour'}`,
        preheader: `Your Spanish class ${reminderType === '24h' ? 'is tomorrow' : 'starts in 1 hour'}`,
        greeting: `Hello ${isStudent ? booking.student.name : booking.teacher.name}!`,
        reminder24h: 'Your Spanish class is scheduled for tomorrow',
        reminder1h: 'Your Spanish class starts in 1 hour!',
        teacherReminder: `Your class with ${booking.student.name} starts in 1 hour`,
        subtitle24h: 'Don\'t forget about your upcoming lesson',
        subtitle1h: 'Get ready to join your class now',
        teacherSubtitle: 'Time to prepare for your lesson',
        classDetails: 'Class Details',
        quickAccess: 'Quick Access',
        joinNow: 'Join Class Now',
        preparation: 'Preparation Checklist',
        studentPrep24h: [
          '📖 Review any materials from previous lessons',
          '🎯 Think about questions you want to ask',
          '📝 Prepare a notebook and pen',
          '💭 Review the topic and vocabulary',
          '⏰ Set a reminder for 1 hour before class'
        ],
        studentPrep1h: [
          '💻 Test your camera and microphone',
          '🌐 Ensure stable internet connection',
          '📝 Have notebook and pen ready',
          '🎧 Put on headphones if needed',
          '🚪 Join the meeting 5 minutes early'
        ],
        teacherPrep: [
          '📚 Review the lesson plan for this topic',
          '🎯 Prepare materials and activities',
          '👤 Check student\'s previous progress',
          '💻 Test your setup and internet',
          '🚪 Join the meeting early to set up'
        ],
        lookingForward: 'Looking forward to your class!',
        timeLeft: reminderType === '24h' ? 'Tomorrow' : 'Starting soon',
        urgent: reminderType === '1h' ? 'Starting Soon!' : '',
        level: 'Level',
        teacher: 'Teacher',
        student: 'Student',
        duration: 'Duration',
        minutes: 'minutes',
        dateFormat: 'EEEE, MMMM do, yyyy',
        timeFormat: 'h:mm a'
      },
      es: {
        title: `Recordatorio de Clase - ${reminderType === '24h' ? '24 Horas' : '1 Hora'}`,
        preheader: `Tu clase de español ${reminderType === '24h' ? 'es mañana' : 'comienza en 1 hora'}`,
        greeting: `¡Hola ${isStudent ? booking.student.name : booking.teacher.name}!`,
        reminder24h: 'Tu clase de español está programada para mañana',
        reminder1h: '¡Tu clase de español comienza en 1 hora!',
        teacherReminder: `Tu clase con ${booking.student.name} comienza en 1 hora`,
        subtitle24h: 'No olvides tu próxima lección',
        subtitle1h: 'Prepárate para unirte a tu clase ahora',
        teacherSubtitle: 'Hora de prepararte para tu lección',
        classDetails: 'Detalles de la Clase',
        quickAccess: 'Acceso Rápido',
        joinNow: 'Unirse a la Clase Ahora',
        preparation: 'Lista de Preparación',
        studentPrep24h: [
          '📖 Revisa cualquier material de lecciones anteriores',
          '🎯 Piensa en las preguntas que quieres hacer',
          '📝 Prepara un cuaderno y bolígrafo',
          '💭 Repasa el tema y vocabulario',
          '⏰ Pon un recordatorio para 1 hora antes de la clase'
        ],
        studentPrep1h: [
          '💻 Prueba tu cámara y micrófono',
          '🌐 Asegúrate de tener conexión estable a internet',
          '📝 Ten tu cuaderno y bolígrafo listos',
          '🎧 Ponte auriculares si es necesario',
          '🚪 Únete a la reunión 5 minutos antes'
        ],
        teacherPrep: [
          '📚 Revisa el plan de lección para este tema',
          '🎯 Prepara materiales y actividades',
          '👤 Verifica el progreso previo del estudiante',
          '💻 Prueba tu configuración e internet',
          '🚪 Únete a la reunión temprano para configurar'
        ],
        lookingForward: '¡Esperamos con ansias tu clase!',
        timeLeft: reminderType === '24h' ? 'Mañana' : 'Comenzando pronto',
        urgent: reminderType === '1h' ? '¡Comenzando Pronto!' : '',
        level: 'Nivel',
        teacher: 'Profesor',
        student: 'Estudiante',
        duration: 'Duración',
        minutes: 'minutos',
        dateFormat: 'EEEE, do \'de\' MMMM \'de\' yyyy',
        timeFormat: 'HH:mm'
      }
    };

    const t = texts[language];
    const endTime = new Date(booking.scheduledAt.getTime() + booking.duration * 60000);

    const reminderMessage = isStudent ? 
      (reminderType === '24h' ? t.reminder24h : t.reminder1h) :
      t.teacherReminder;

    const subtitle = isStudent ?
      (reminderType === '24h' ? t.subtitle24h : t.subtitle1h) :
      t.teacherSubtitle;

    const prepList = isStudent ?
      (reminderType === '24h' ? t.studentPrep24h : t.studentPrep1h) :
      t.teacherPrep;

    const content = `
      <h2>${this.getEmoji('reminder')} ${t.greeting}</h2>
      
      ${reminderType === '1h' ? `
      <div class="alert alert-warning">
        <h3 style="margin: 0 0 8px 0; color: #92400e;">⚡ ${t.urgent}</h3>
        <p style="margin: 0; color: #92400e; font-weight: 600;">${reminderMessage}</p>
      </div>
      ` : `
      <div class="alert alert-info">
        <h3 style="margin: 0 0 8px 0; color: #1e40af;">${reminderMessage}</h3>
        <p style="margin: 0; color: #1e40af;">${subtitle}</p>
      </div>
      `}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📚</span>
          <h3 class="card-title">${t.classDetails}</h3>
        </div>
        
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
          <div style="flex: 1;">
            <p><strong>Tema:</strong> ${booking.topic.name}</p>
            <p><strong>${t.level}:</strong> ${booking.topic.level}</p>
            ${booking.topic.tema ? `<p><strong>Enfoque:</strong> ${booking.topic.tema}</p>` : ''}
          </div>
          <div style="flex: 1;">
            <p><strong>${isStudent ? t.teacher : t.student}:</strong> ${isStudent ? booking.teacher.name : booking.student.name}</p>
            <p><strong>${t.duration}:</strong> ${booking.duration} ${t.minutes}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border-radius: 8px; margin: 16px 0;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
            ${format(booking.scheduledAt, t.timeFormat, { locale })}
          </div>
          <div style="font-size: 16px; opacity: 0.9;">
            ${format(booking.scheduledAt, t.dateFormat, { locale })}
          </div>
          <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">
            ${format(booking.scheduledAt, t.timeFormat, { locale })} - ${format(endTime, t.timeFormat, { locale })}
          </div>
        </div>
      </div>
      
      ${booking.googleMeetLink && reminderType === '1h' ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📹</span>
          <h3 class="card-title">${t.quickAccess}</h3>
        </div>
        
        <div style="text-align: center;">
          <a href="${booking.googleMeetLink}" class="button button-success" style="font-size: 18px; padding: 16px 32px;">
            🚀 ${t.joinNow}
          </a>
          <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280; word-break: break-all;">
            ${booking.googleMeetLink}
          </p>
        </div>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">✅</span>
          <h3 class="card-title">${t.preparation}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${prepList.map(item => `<li style="margin: 12px 0; line-height: 1.5;">${item}</li>`).join('')}
        </ul>
      </div>
      
      ${reminderType === '24h' ? `
      <div class="alert alert-info">
        <p style="margin: 0;"><strong>⏰ ${language === 'es' ? 'Próximo recordatorio' : 'Next reminder'}:</strong> 
        ${language === 'es' ? 'Recibirás otro recordatorio 1 hora antes de la clase.' : 'You\'ll receive another reminder 1 hour before class.'}</p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 32px 0;">
        <p style="font-size: 18px; color: #4f46e5; font-weight: 600;">${t.lookingForward}</p>
      </div>
    `;

    return this.getBaseTemplate({
      title: t.title,
      preheader: t.preheader,
      language,
      content,
    });
  }

  getSubject(language: 'en' | 'es', reminderType: '24h' | '1h'): string {
    if (language === 'es') {
      return reminderType === '24h' 
        ? '📅 Recordatorio: Tu clase de español es mañana'
        : '⏰ ¡Urgente! Tu clase comienza en 1 hora';
    } else {
      return reminderType === '24h'
        ? '📅 Reminder: Your Spanish class is tomorrow'
        : '⏰ Urgent! Your class starts in 1 hour';
    }
  }

  getTeacherSubject(language: 'en' | 'es'): string {
    return language === 'es'
      ? '👨‍🏫 Recordatorio: Clase en 1 hora con tu estudiante'
      : '👨‍🏫 Reminder: Class in 1 hour with your student';
  }
}