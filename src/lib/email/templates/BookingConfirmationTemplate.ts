import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export interface BookingConfirmationTemplateProps {
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
  recipient: 'student' | 'teacher';
  language: 'en' | 'es';
}

export class BookingConfirmationTemplate extends BaseTemplate implements EmailTemplate {
  render(data: BookingConfirmationTemplateProps): string {
    const { booking, recipient, language } = data;
    const isStudent = recipient === 'student';
    const locale = language === 'es' ? es : enUS;

    const texts = {
      en: {
        title: 'Class Booking Confirmed',
        preheader: 'Your Spanish class has been successfully booked',
        greeting: `Hello ${isStudent ? booking.student.name : booking.teacher.name}!`,
        confirmed: isStudent ? 'Your Spanish class has been confirmed!' : 'New student booking confirmed!',
        subtitle: isStudent ? 'Get ready for an amazing learning experience' : 'You have a new student to teach',
        classDetails: 'Class Details',
        schedule: 'Schedule',
        participants: 'Participants',
        meetingLink: 'Join the Class',
        joinMeet: 'Join Google Meet',
        importantNotes: 'Important Notes',
        studentNotes: [
          'Please join the meeting 5 minutes before the scheduled time',
          'Make sure you have a stable internet connection',
          'Test your camera and microphone beforehand',
          'Have your learning materials ready',
          'If you need to cancel, please do so at least 24 hours in advance'
        ],
        teacherNotes: [
          'Join the meeting a few minutes early to prepare',
          'Please prepare the lesson materials for this topic',
          'Review the student\'s level and previous progress',
          'Have backup activities ready in case needed',
          'Contact support if you encounter any technical issues'
        ],
        dateFormat: 'EEEE, MMMM do, yyyy',
        timeFormat: 'h:mm a',
        timezone: 'Your local timezone',
        duration: 'Duration',
        minutes: 'minutes',
        level: 'Level',
        theme: 'Theme',
        vocabulary: 'Vocabulary',
        description: 'Description',
        student: 'Student',
        teacher: 'Teacher',
        bookingId: 'Booking ID',
        calendarNote: 'This booking has been automatically added to your Google Calendar.',
        lookingForward: isStudent ? 
          'We\'re looking forward to your class!' : 
          'Thank you for being part of our teaching team!'
      },
      es: {
        title: 'Reserva de Clase Confirmada',
        preheader: 'Tu clase de español ha sido reservada exitosamente',
        greeting: `¡Hola ${isStudent ? booking.student.name : booking.teacher.name}!`,
        confirmed: isStudent ? '¡Tu clase de español ha sido confirmada!' : '¡Nueva reserva de estudiante confirmada!',
        subtitle: isStudent ? 'Prepárate para una experiencia de aprendizaje increíble' : 'Tienes un nuevo estudiante para enseñar',
        classDetails: 'Detalles de la Clase',
        schedule: 'Horario',
        participants: 'Participantes',
        meetingLink: 'Unirse a la Clase',
        joinMeet: 'Unirse a Google Meet',
        importantNotes: 'Notas Importantes',
        studentNotes: [
          'Por favor únete a la reunión 5 minutos antes de la hora programada',
          'Asegúrate de tener una conexión a internet estable',
          'Prueba tu cámara y micrófono con anticipación',
          'Ten tus materiales de aprendizaje listos',
          'Si necesitas cancelar, hazlo al menos 24 horas antes'
        ],
        teacherNotes: [
          'Únete a la reunión unos minutos antes para prepararte',
          'Por favor prepara los materiales de la lección para este tema',
          'Revisa el nivel del estudiante y su progreso previo',
          'Ten actividades de respaldo listas en caso de necesitarlas',
          'Contacta soporte si encuentras problemas técnicos'
        ],
        dateFormat: 'EEEE, do \'de\' MMMM \'de\' yyyy',
        timeFormat: 'HH:mm',
        timezone: 'Tu zona horaria local',
        duration: 'Duración',
        minutes: 'minutos',
        level: 'Nivel',
        theme: 'Tema',
        vocabulary: 'Vocabulario',
        description: 'Descripción',
        student: 'Estudiante',
        teacher: 'Profesor',
        bookingId: 'ID de Reserva',
        calendarNote: 'Esta reserva ha sido agregada automáticamente a tu Google Calendar.',
        lookingForward: isStudent ? 
          '¡Esperamos con ansias tu clase!' : 
          '¡Gracias por ser parte de nuestro equipo docente!'
      }
    };

    const t = texts[language];
    const endTime = new Date(booking.scheduledAt.getTime() + booking.duration * 60000);

    const content = `
      <h2>${this.getEmoji('booking')} ${t.greeting}</h2>
      
      <div class="alert alert-success">
        <h3 style="margin: 0 0 8px 0; color: #047857;">${t.confirmed}</h3>
        <p style="margin: 0; color: #047857;">${t.subtitle}</p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📚</span>
          <h3 class="card-title">${t.classDetails}</h3>
        </div>
        
        <div style="margin-bottom: 16px;">
          <p><strong>${t.level}:</strong> ${booking.topic.level}</p>
          <p><strong>Tema:</strong> ${booking.topic.name}</p>
          ${booking.topic.tema ? `<p><strong>${t.theme}:</strong> ${booking.topic.tema}</p>` : ''}
          ${booking.topic.vocabulario ? `<p><strong>${t.vocabulary}:</strong> ${booking.topic.vocabulario}</p>` : ''}
          ${booking.topic.description ? `<p><strong>${t.description}:</strong> ${booking.topic.description}</p>` : ''}
        </div>
        
        <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>${t.bookingId}:</strong> ${booking.id}</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🕒</span>
          <h3 class="card-title">${t.schedule}</h3>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <p class="stat-number">${format(booking.scheduledAt, 'dd', { locale })}</p>
            <p class="stat-label">${format(booking.scheduledAt, 'MMM', { locale }).toUpperCase()}</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">${format(booking.scheduledAt, t.timeFormat, { locale })}</p>
            <p class="stat-label">${t.timezone}</p>
          </div>
          <div class="stat-item">
            <p class="stat-number">${booking.duration}</p>
            <p class="stat-label">${t.minutes}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 16px 0; padding: 16px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px;">
          <p style="margin: 0; font-weight: 600; color: #0c4a6e;">
            📅 ${format(booking.scheduledAt, t.dateFormat, { locale })}
          </p>
          <p style="margin: 4px 0 0 0; color: #0369a1;">
            ⏰ ${format(booking.scheduledAt, t.timeFormat, { locale })} - ${format(endTime, t.timeFormat, { locale })}
          </p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">👥</span>
          <h3 class="card-title">${t.participants}</h3>
        </div>
        
        <div style="display: flex; gap: 16px;">
          <div style="flex: 1; padding: 12px; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">${t.student}</p>
            <p style="margin: 4px 0 0 0; color: #92400e;">${booking.student.name}</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #a16207;">${booking.student.email}</p>
          </div>
          <div style="flex: 1; padding: 12px; background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px;">
            <p style="margin: 0; font-weight: 600; color: #047857;">${t.teacher}</p>
            <p style="margin: 4px 0 0 0; color: #047857;">${booking.teacher.name}</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #059669;">${booking.teacher.email}</p>
          </div>
        </div>
      </div>
      
      ${booking.googleMeetLink ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📹</span>
          <h3 class="card-title">${t.meetingLink}</h3>
        </div>
        
        <div style="text-align: center;">
          <a href="${booking.googleMeetLink}" class="button button-success">${t.joinMeet}</a>
          <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280; word-break: break-all;">
            <strong>Link:</strong> ${booking.googleMeetLink}
          </p>
        </div>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">💡</span>
          <h3 class="card-title">${t.importantNotes}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${(isStudent ? t.studentNotes : t.teacherNotes).map(note => `<li style="margin: 8px 0;">${note}</li>`).join('')}
        </ul>
      </div>
      
      <div class="alert alert-info">
        <p style="margin: 0;"><strong>📅</strong> ${t.calendarNote}</p>
      </div>
      
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

  getSubject(language: 'en' | 'es', recipient: 'student' | 'teacher' = 'student'): string {
    if (language === 'es') {
      return recipient === 'student' 
        ? '✅ Clase Confirmada - Tu sesión de español está reservada'
        : '👨‍🏫 Nueva Reserva - Tienes un estudiante programado';
    } else {
      return recipient === 'student'
        ? '✅ Class Confirmed - Your Spanish session is booked'
        : '👨‍🏫 New Booking - You have a student scheduled';
    }
  }
}