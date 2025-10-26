import { COLORS, SPACING } from './types';

export interface BaseTemplateProps {
  title: string;
  preheader: string;
  language: 'en' | 'es';
  content: string;
  footerContent?: string;
}

export class BaseTemplate {
  protected getBaseTemplate(props: BaseTemplateProps): string {
    const { title, preheader, language, content, footerContent } = props;
    
    const texts = {
      en: {
        viewInBrowser: 'View this email in your browser',
        alumni: 'Alumni by Better',
        tagline: 'Connecting Alumni Through Learning',
        support: 'Need help?',
        contactUs: 'Contact us',
        unsubscribe: 'Unsubscribe',
        preferences: 'Email preferences',
        rights: 'All rights reserved',
        address: 'Alumni by Better, Spanish Learning Platform',
      },
      es: {
        viewInBrowser: 'Ver este email en tu navegador',
        alumni: 'Alumni by Better',
        tagline: 'Conectando Alumni a través del Aprendizaje',
        support: '¿Necesitas ayuda?',
        contactUs: 'Contáctanos',
        unsubscribe: 'Cancelar suscripción',
        preferences: 'Preferencias de email',
        rights: 'Todos los derechos reservados',
        address: 'Alumni by Better, Plataforma de Aprendizaje de Español',
      },
    };

    const t = texts[language];

    return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
        <style type="text/css">
            /* Reset styles */
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
            
            /* Base styles */
            body {
                width: 100% !important;
                height: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: ${COLORS.gray[100]};
            }
            
            /* Container styles */
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }
            
            /* Header styles */
            .header {
                background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
                padding: ${SPACING.xl} ${SPACING.lg};
                text-align: center;
            }
            
            .header h1 {
                color: #ffffff;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 ${SPACING.sm} 0;
                line-height: 1.2;
            }
            
            .header .tagline {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                margin: 0;
                font-weight: 400;
            }
            
            /* Content styles */
            .content {
                padding: ${SPACING.xl} ${SPACING.lg};
                line-height: 1.6;
                color: ${COLORS.gray[700]};
            }
            
            .content h2 {
                color: ${COLORS.gray[800]};
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 ${SPACING.lg} 0;
                line-height: 1.3;
            }
            
            .content h3 {
                color: ${COLORS.gray[800]};
                font-size: 18px;
                font-weight: 600;
                margin: ${SPACING.lg} 0 ${SPACING.md} 0;
                line-height: 1.4;
            }
            
            .content p {
                margin: 0 0 ${SPACING.md} 0;
                font-size: 16px;
            }
            
            .content ul, .content ol {
                margin: ${SPACING.md} 0;
                padding-left: ${SPACING.lg};
            }
            
            .content li {
                margin: ${SPACING.sm} 0;
                font-size: 16px;
            }
            
            /* Card styles */
            .card {
                background-color: ${COLORS.gray[50]};
                border: 1px solid ${COLORS.gray[200]};
                border-radius: 8px;
                padding: ${SPACING.lg};
                margin: ${SPACING.lg} 0;
            }
            
            .card-header {
                display: flex;
                align-items: center;
                margin-bottom: ${SPACING.md};
            }
            
            .card-icon {
                font-size: 24px;
                margin-right: ${SPACING.md};
            }
            
            .card-title {
                font-size: 18px;
                font-weight: 600;
                color: ${COLORS.gray[800]};
                margin: 0;
            }
            
            /* Button styles */
            .button {
                display: inline-block;
                background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%);
                color: #ffffff !important;
                text-decoration: none !important;
                padding: 14px 28px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                line-height: 1;
                margin: ${SPACING.md} 0;
                box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
                transition: all 0.2s ease;
            }
            
            .button:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
            }
            
            .button-secondary {
                background: transparent;
                color: ${COLORS.primary} !important;
                border: 2px solid ${COLORS.primary};
                box-shadow: none;
            }
            
            .button-success {
                background: linear-gradient(135deg, ${COLORS.success} 0%, #047857 100%);
                box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
            }
            
            .button-warning {
                background: linear-gradient(135deg, ${COLORS.warning} 0%, #d97706 100%);
                box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
            }
            
            /* Alert styles */
            .alert {
                padding: ${SPACING.md};
                border-radius: 6px;
                margin: ${SPACING.md} 0;
                border-left: 4px solid;
            }
            
            .alert-info {
                background-color: #eff6ff;
                border-color: ${COLORS.info};
                color: #1e40af;
            }
            
            .alert-success {
                background-color: #ecfdf5;
                border-color: ${COLORS.success};
                color: #047857;
            }
            
            .alert-warning {
                background-color: #fffbeb;
                border-color: ${COLORS.warning};
                color: #92400e;
            }
            
            .alert-danger {
                background-color: #fef2f2;
                border-color: ${COLORS.danger};
                color: #b91c1c;
            }
            
            /* Stats styles */
            .stats-grid {
                display: flex;
                gap: ${SPACING.md};
                margin: ${SPACING.lg} 0;
            }
            
            .stat-item {
                flex: 1;
                text-align: center;
                padding: ${SPACING.md};
                background-color: #ffffff;
                border: 1px solid ${COLORS.gray[200]};
                border-radius: 6px;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: 700;
                color: ${COLORS.primary};
                margin: 0;
            }
            
            .stat-label {
                font-size: 14px;
                color: ${COLORS.gray[600]};
                margin: ${SPACING.xs} 0 0 0;
            }
            
            /* Footer styles */
            .footer {
                background-color: ${COLORS.gray[800]};
                color: ${COLORS.gray[300]};
                padding: ${SPACING.xl} ${SPACING.lg};
                text-align: center;
            }
            
            .footer p {
                margin: 0 0 ${SPACING.sm} 0;
                font-size: 14px;
            }
            
            .footer a {
                color: ${COLORS.gray[300]} !important;
                text-decoration: underline;
            }
            
            .footer a:hover {
                color: #ffffff !important;
            }
            
            .footer-links {
                margin: ${SPACING.md} 0;
            }
            
            .footer-links a {
                margin: 0 ${SPACING.sm};
                text-decoration: none;
            }
            
            /* Preheader styles */
            .preheader {
                display: none !important;
                visibility: hidden;
                opacity: 0;
                color: transparent;
                height: 0;
                width: 0;
                font-size: 1px;
                line-height: 1px;
                max-height: 0;
                max-width: 0;
                mso-hide: all;
            }
            
            /* Mobile responsive */
            @media only screen and (max-width: 600px) {
                .email-container {
                    width: 100% !important;
                    margin: 0 !important;
                }
                
                .header, .content, .footer {
                    padding: ${SPACING.lg} ${SPACING.md} !important;
                }
                
                .header h1 {
                    font-size: 24px !important;
                }
                
                .stats-grid {
                    flex-direction: column;
                    gap: ${SPACING.sm};
                }
                
                .button {
                    width: 100% !important;
                    text-align: center !important;
                    box-sizing: border-box;
                }
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .email-container {
                    background-color: #1f2937 !important;
                }
                
                .content {
                    color: #e5e7eb !important;
                }
                
                .content h2, .content h3 {
                    color: #f3f4f6 !important;
                }
                
                .card {
                    background-color: #374151 !important;
                    border-color: #4b5563 !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="preheader">${preheader}</div>
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td align="center" style="padding: ${SPACING.lg} 0; background-color: ${COLORS.gray[100]};">
                    <div class="email-container">
                        <!-- Header -->
                        <div class="header">
                            <h1>🎓 ${t.alumni}</h1>
                            <p class="tagline">${t.tagline}</p>
                        </div>
                        
                        <!-- Content -->
                        <div class="content">
                            ${content}
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <p><strong>${t.alumni}</strong></p>
                            <p>${t.address}</p>
                            
                            ${footerContent || ''}
                            
                            <div class="footer-links">
                                <a href="${process.env.NEXTAUTH_URL || 'https://alumni-lms.com'}">${t.alumni}</a>
                                <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@alumni-better.com'}">${t.contactUs}</a>
                            </div>
                            
                            <p style="margin-top: ${SPACING.lg}; font-size: 12px; color: ${COLORS.gray[400]};">
                                © ${new Date().getFullYear()} ${t.alumni}. ${t.rights}
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
  }

  protected getEmoji(type: 'welcome' | 'booking' | 'reminder' | 'cancellation' | 'progress' | 'certificate' | 'engagement' | 'summary'): string {
    const emojis = {
      welcome: '🎉',
      booking: '📚',
      reminder: '⏰',
      cancellation: '❌',
      progress: '📊',
      certificate: '🏆',
      engagement: '💡',
      summary: '📋',
    };
    return emojis[type] || '📧';
  }
}