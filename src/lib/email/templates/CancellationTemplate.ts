import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export interface CancellationTemplateProps {
  booking: {
    id: string;
    scheduledAt: Date;
    duration: number;
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
    };
  };
  cancelledBy: 'student' | 'teacher';
  reason?: string;
  recipient: 'student' | 'teacher';
  language: 'en' | 'es';
}

export class CancellationTemplate extends BaseTemplate implements EmailTemplate {
  render(data: CancellationTemplateProps): string {
    const { booking, cancelledBy, reason, recipient, language } = data;
    const isStudent = recipient === 'student';
    const locale = language === 'es' ? es : enUS;

    const texts = {
      en: {
        title: 'Class Booking Cancelled',
        preheader: 'Your Spanish class has been cancelled',
        greeting: `Hello ${isStudent ? booking.student.name : booking.teacher.name},`,
        cancelled: 'Class Cancelled',
        cancelledByStudent: 'The following class has been cancelled by the student:',
        cancelledByTeacher: 'The following class has been cancelled by the teacher:',
        cancelledByYou: 'You have successfully cancelled the following class:',
        cancelledDetails: 'Cancelled Class Details',
        nextSteps: 'What\'s Next?',
        studentNextSteps: [
          '💳 Your lesson credit has been restored to your account',
          '📅 You can book a new class anytime from your dashboard',
          '🔄 Choose a different time slot that works better for you',
          '📞 Contact support if you need assistance rebooking'
        ],
        teacherNextSteps: [
          '📅 This time slot is now available for new bookings',
          '🔔 You\'ll be notified of any new student bookings',
          '📊 Your schedule has been automatically updated',
          '💬 Contact support if you have any questions'
        ],
        refund: 'Lesson Credit Restored',
        refundNote: 'Your lesson credit has been automatically restored and is ready to use for your next booking.',
        reschedule: 'Ready to Reschedule?',
        bookAnother: 'Book Another Class',
        reason: 'Cancellation Reason',
        dateFormat: 'EEEE, MMMM do, yyyy',
        timeFormat: 'h:mm a',
        level: 'Level',
        teacher: 'Teacher',
        student: 'Student',
        duration: 'Duration',
        minutes: 'minutes',
        support: 'Need help finding a new time? Our support team is here to assist you.',
        calendarNote: 'The Google Calendar event has been automatically removed.'
      },
      es: {
        title: 'Reserva de Clase Cancelada',
        preheader: 'Tu clase de español ha sido cancelada',
        greeting: `Hola ${isStudent ? booking.student.name : booking.teacher.name},`,
        cancelled: 'Clase Cancelada',
        cancelledByStudent: 'La siguiente clase ha sido cancelada por el estudiante:',
        cancelledByTeacher: 'La siguiente clase ha sido cancelada por el profesor:',
        cancelledByYou: 'Has cancelado exitosamente la siguiente clase:',
        cancelledDetails: 'Detalles de la Clase Cancelada',
        nextSteps: '¿Qué Sigue?',
        studentNextSteps: [
          '💳 Tu crédito de lección ha sido restaurado a tu cuenta',
          '📅 Puedes reservar una nueva clase cuando quieras desde tu panel',
          '🔄 Elige un horario diferente que funcione mejor para ti',
          '📞 Contacta soporte si necesitas ayuda para reagendar'
        ],
        teacherNextSteps: [
          '📅 Este horario ahora está disponible para nuevas reservas',
          '🔔 Serás notificado de cualquier nueva reserva de estudiante',
          '📊 Tu horario ha sido actualizado automáticamente',
          '💬 Contacta soporte si tienes alguna pregunta'
        ],
        refund: 'Crédito de Lección Restaurado',
        refundNote: 'Tu crédito de lección ha sido restaurado automáticamente y está listo para usar en tu próxima reserva.',
        reschedule: '¿Listo para Reagendar?',
        bookAnother: 'Reservar Otra Clase',
        reason: 'Motivo de Cancelación',
        dateFormat: 'EEEE, do \'de\' MMMM \'de\' yyyy',
        timeFormat: 'HH:mm',
        level: 'Nivel',
        teacher: 'Profesor',
        student: 'Estudiante',
        duration: 'Duración',
        minutes: 'minutos',
        support: '¿Necesitas ayuda para encontrar un nuevo horario? Nuestro equipo de soporte está aquí para asistirte.',
        calendarNote: 'El evento de Google Calendar ha sido eliminado automáticamente.'
      }
    };

    const t = texts[language];
    const endTime = new Date(booking.scheduledAt.getTime() + booking.duration * 60000);

    let cancellationMessage = '';
    if (isStudent && cancelledBy === 'student') {
      cancellationMessage = t.cancelledByYou;
    } else if (isStudent && cancelledBy === 'teacher') {
      cancellationMessage = t.cancelledByTeacher;
    } else if (!isStudent && cancelledBy === 'student') {
      cancellationMessage = t.cancelledByStudent;
    } else {
      cancellationMessage = t.cancelledByYou;
    }

    const nextStepsList = isStudent ? t.studentNextSteps : t.teacherNextSteps;

    const content = `
      <h2>${this.getEmoji('cancellation')} ${t.greeting}</h2>
      
      <div class="alert alert-danger">
        <h3 style="margin: 0 0 8px 0; color: #b91c1c;">${t.cancelled}</h3>
        <p style="margin: 0; color: #b91c1c;">${cancellationMessage}</p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📚</span>
          <h3 class="card-title">${t.cancelledDetails}</h3>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;">
              <p style="margin: 0 0 8px 0;"><strong>Tema:</strong> ${booking.topic.name}</p>
              <p style="margin: 0 0 8px 0;"><strong>${t.level}:</strong> ${booking.topic.level}</p>
              <p style="margin: 0;"><strong>${t.duration}:</strong> ${booking.duration} ${t.minutes}</p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0 0 8px 0;"><strong>${isStudent ? t.teacher : t.student}:</strong> 
                ${isStudent ? booking.teacher.name : booking.student.name}
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Fecha:</strong> ${format(booking.scheduledAt, t.dateFormat, { locale })}</p>
              <p style="margin: 0;"><strong>Hora:</strong> ${format(booking.scheduledAt, t.timeFormat, { locale })} - ${format(endTime, t.timeFormat, { locale })}</p>
            </div>
          </div>
        </div>
        
        ${reason ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; font-weight: 600; color: #475569;">${t.reason}:</p>
          <p style="margin: 4px 0 0 0; color: #64748b; font-style: italic;">"${reason}"</p>
        </div>
        ` : ''}
      </div>
      
      ${isStudent && cancelledBy === 'student' ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">💳</span>
          <h3 class="card-title">${t.refund}</h3>
        </div>
        
        <div class="alert alert-success">
          <p style="margin: 0;"><strong>✅</strong> ${t.refundNote}</p>
        </div>
      </div>
      ` : ''}
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🔄</span>
          <h3 class="card-title">${t.nextSteps}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${nextStepsList.map(step => `<li style="margin: 12px 0; line-height: 1.5;">${step}</li>`).join('')}
        </ul>
      </div>
      
      ${isStudent ? `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📅</span>
          <h3 class="card-title">${t.reschedule}</h3>
        </div>
        
        <div style="text-align: center; margin: 16px 0;">
          <a href="${process.env.NEXTAUTH_URL}/schedule" class="button">${t.bookAnother}</a>
        </div>
        
        <p style="text-align: center; margin: 12px 0; color: #6b7280; font-size: 14px;">
          ${t.support}
        </p>
      </div>
      ` : ''}
      
      <div class="alert alert-info">
        <p style="margin: 0;"><strong>📅</strong> ${t.calendarNote}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
          ${language === 'es' ? 
            'Esperamos verte pronto en una nueva clase.' : 
            'We look forward to seeing you in a new class soon.'
          }
        </p>
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
      ? '❌ Clase Cancelada - Información sobre tu reserva'
      : '❌ Class Cancelled - Information about your booking';
  }
}