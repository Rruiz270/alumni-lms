import { EmailTemplate } from './types';
import { BaseTemplate } from './BaseTemplate';

export interface PasswordResetTemplateProps {
  user: {
    name: string;
    email: string;
  };
  resetUrl: string;
  language: 'en' | 'es';
  expiryTime: string;
}

export class PasswordResetTemplate extends BaseTemplate implements EmailTemplate {
  render(data: PasswordResetTemplateProps): string {
    const { user, resetUrl, language, expiryTime } = data;

    const texts = {
      en: {
        title: 'Reset Your Password',
        preheader: 'Reset your Alumni by Better account password',
        greeting: `Hello ${user.name},`,
        subtitle: 'Password Reset Request',
        intro: 'We received a request to reset the password for your Alumni by Better account.',
        action: 'Click the button below to reset your password:',
        resetButton: 'Reset Password',
        expiry: `This link will expire in ${expiryTime}.`,
        notYou: 'If you didn\'t request this password reset, please ignore this email. Your password will remain unchanged.',
        security: 'Security Tips',
        securityTips: [
          '🔐 Use a strong, unique password for your account',
          '🚫 Never share your password with anyone',
          '🔄 Consider using a password manager',
          '📱 Enable two-factor authentication if available',
          '⚠️ Be cautious of phishing emails asking for your credentials'
        ],
        manual: 'If the button doesn\'t work, copy and paste this link into your browser:',
        help: 'Need help? Contact our support team.',
        closing: 'Stay safe and happy learning!',
        team: 'The Alumni by Better Security Team'
      },
      es: {
        title: 'Restablecer tu Contraseña',
        preheader: 'Restablece la contraseña de tu cuenta Alumni by Better',
        greeting: `Hola ${user.name},`,
        subtitle: 'Solicitud de Restablecimiento de Contraseña',
        intro: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta Alumni by Better.',
        action: 'Haz clic en el botón de abajo para restablecer tu contraseña:',
        resetButton: 'Restablecer Contraseña',
        expiry: `Este enlace expirará en ${expiryTime}.`,
        notYou: 'Si no solicitaste este restablecimiento de contraseña, por favor ignora este email. Tu contraseña permanecerá sin cambios.',
        security: 'Consejos de Seguridad',
        securityTips: [
          '🔐 Usa una contraseña fuerte y única para tu cuenta',
          '🚫 Nunca compartas tu contraseña con nadie',
          '🔄 Considera usar un administrador de contraseñas',
          '📱 Habilita la autenticación de dos factores si está disponible',
          '⚠️ Ten cuidado con emails de phishing que soliciten tus credenciales'
        ],
        manual: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
        help: '¿Necesitas ayuda? Contacta a nuestro equipo de soporte.',
        closing: '¡Mantente seguro y feliz aprendizaje!',
        team: 'El Equipo de Seguridad de Alumni by Better'
      }
    };

    const t = texts[language];

    const content = `
      <h2>🔐 ${t.greeting}</h2>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🔑</span>
          <h3 class="card-title">${t.subtitle}</h3>
        </div>
        <p>${t.intro}</p>
      </div>
      
      <p>${t.action}</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" class="button" style="font-size: 18px; padding: 16px 32px;">
          🔄 ${t.resetButton}
        </a>
      </div>
      
      <div class="alert alert-warning">
        <p style="margin: 0;"><strong>⏰ ${language === 'es' ? 'Importante' : 'Important'}:</strong> ${t.expiry}</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>${t.manual}</strong></p>
        <p style="margin: 0; font-size: 12px; color: #64748b; word-break: break-all; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db;">
          ${resetUrl}
        </p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🛡️</span>
          <h3 class="card-title">${t.security}</h3>
        </div>
        
        <ul style="margin: 0; padding-left: 20px;">
          ${t.securityTips.map(tip => `<li style="margin: 12px 0; line-height: 1.5;">${tip}</li>`).join('')}
        </ul>
      </div>
      
      <div class="alert alert-info">
        <p style="margin: 0;"><strong>🤔</strong> ${t.notYou}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0; padding: 20px; background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
        <p style="margin: 0 0 8px 0; color: #0c4a6e; font-weight: 600;">${t.help}</p>
        <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@alumni-better.com'}" style="color: #0369a1; text-decoration: underline;">
          ${process.env.SUPPORT_EMAIL || 'support@alumni-better.com'}
        </a>
      </div>
      
      <p>${t.closing}</p>
      <p><strong>${t.team}</strong></p>
    `;

    return this.getBaseTemplate({
      title: t.title,
      preheader: t.preheader,
      language,
      content,
      footerContent: `
        <div class="alert alert-danger" style="background-color: rgba(220, 38, 38, 0.1); color: #b91c1c; text-align: center; font-size: 12px;">
          <p style="margin: 0;"><strong>🚨 ${language === 'es' ? 'Advertencia de Seguridad' : 'Security Warning'}:</strong> 
          ${language === 'es' ? 
            'Si no solicitaste este restablecimiento, alguien más podría estar intentando acceder a tu cuenta. Contacta soporte inmediatamente.' : 
            'If you didn\'t request this reset, someone else might be trying to access your account. Contact support immediately.'
          }</p>
        </div>
      `
    });
  }

  getSubject(language: 'en' | 'es'): string {
    return language === 'es'
      ? '🔐 Restablece tu contraseña de Alumni by Better'
      : '🔐 Reset your Alumni by Better password';
  }
}