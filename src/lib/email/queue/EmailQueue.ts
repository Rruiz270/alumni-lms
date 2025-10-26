import { EmailOptions } from '../emailService';

export interface EmailQueueJob {
  id: string;
  type: 'send_email' | 'bulk_email' | 'reminder' | 'follow_up';
  data: EmailOptions | BulkEmailData;
  priority: 'high' | 'medium' | 'low';
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
}

export interface BulkEmailData {
  recipients: string[];
  template: string;
  data: any;
  batchSize?: number;
}

export interface QueueConfig {
  maxConcurrent: number;
  retryDelay: number;
  maxRetries: number;
  batchSize: number;
  rateLimitPerMinute: number;
}

export class EmailQueue {
  private queue: EmailQueueJob[] = [];
  private processing: Set<string> = new Set();
  private config: QueueConfig;
  private isRunning: boolean = false;
  private rateLimitCounter: number = 0;
  private rateLimitResetTime: number = Date.now() + 60000; // Reset every minute

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: 5,
      retryDelay: 5000, // 5 seconds
      maxRetries: 3,
      batchSize: 50,
      rateLimitPerMinute: 100,
      ...config
    };

    // Start processing queue
    this.startProcessing();
  }

  /**
   * Add job to queue
   */
  async add(jobData: {
    type: EmailQueueJob['type'];
    data: EmailOptions | BulkEmailData;
    priority?: EmailQueueJob['priority'];
    scheduledFor?: Date;
  }): Promise<string> {
    const job: EmailQueueJob = {
      id: this.generateJobId(),
      type: jobData.type,
      data: jobData.data,
      priority: jobData.priority || 'medium',
      scheduledFor: jobData.scheduledFor,
      attempts: 0,
      maxAttempts: this.config.maxRetries,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert job based on priority
    this.insertJobByPriority(job);
    
    console.log(`Email job added to queue: ${job.id} (${job.type})`);
    return job.id;
  }

  /**
   * Start processing queue
   */
  private startProcessing(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processQueue();
  }

  /**
   * Stop processing queue
   */
  stopProcessing(): void {
    this.isRunning = false;
  }

  /**
   * Process queue continuously
   */
  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        // Check rate limiting
        if (!this.checkRateLimit()) {
          await this.delay(1000); // Wait 1 second before checking again
          continue;
        }

        // Get next job to process
        const job = this.getNextJob();
        if (!job) {
          await this.delay(1000); // Wait 1 second before checking for new jobs
          continue;
        }

        // Check if we can process more jobs concurrently
        if (this.processing.size >= this.config.maxConcurrent) {
          await this.delay(500); // Wait before checking again
          continue;
        }

        // Process job
        this.processJob(job);
      } catch (error) {
        console.error('Error in queue processing:', error);
        await this.delay(5000); // Wait 5 seconds on error
      }
    }
  }

  /**
   * Get next job to process
   */
  private getNextJob(): EmailQueueJob | null {
    const now = new Date();
    
    // Find first job that is pending, not being processed, and scheduled for now or past
    const job = this.queue.find(j => 
      j.status === 'pending' && 
      !this.processing.has(j.id) &&
      (!j.scheduledFor || j.scheduledFor <= now)
    );

    return job || null;
  }

  /**
   * Process individual job
   */
  private async processJob(job: EmailQueueJob): Promise<void> {
    this.processing.add(job.id);
    job.status = 'processing';
    job.updatedAt = new Date();

    try {
      console.log(`Processing email job: ${job.id} (${job.type})`);
      
      switch (job.type) {
        case 'send_email':
          await this.processSingleEmail(job);
          break;
        case 'bulk_email':
          await this.processBulkEmail(job);
          break;
        case 'reminder':
          await this.processReminder(job);
          break;
        case 'follow_up':
          await this.processFollowUp(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      job.updatedAt = new Date();
      console.log(`Email job completed: ${job.id}`);
      
    } catch (error) {
      console.error(`Email job failed: ${job.id}`, error);
      await this.handleJobFailure(job, error as Error);
    } finally {
      this.processing.delete(job.id);
      this.incrementRateLimit();
    }
  }

  /**
   * Process single email job
   */
  private async processSingleEmail(job: EmailQueueJob): Promise<void> {
    const emailData = job.data as EmailOptions;
    
    // Import EmailService here to avoid circular dependency
    const { emailService } = await import('../emailService');
    
    const success = await emailService.sendEmail(emailData);
    if (!success) {
      throw new Error('Failed to send email');
    }
  }

  /**
   * Process bulk email job
   */
  private async processBulkEmail(job: EmailQueueJob): Promise<void> {
    const bulkData = job.data as BulkEmailData;
    const batchSize = bulkData.batchSize || this.config.batchSize;
    
    // Split recipients into batches
    for (let i = 0; i < bulkData.recipients.length; i += batchSize) {
      const batch = bulkData.recipients.slice(i, i + batchSize);
      
      // Process batch with delay to respect rate limits
      for (const recipient of batch) {
        if (!this.checkRateLimit()) {
          await this.delay(60000 / this.config.rateLimitPerMinute); // Wait to respect rate limit
        }

        try {
          // Create individual email for recipient
          const emailOptions: EmailOptions = {
            to: recipient,
            subject: bulkData.template, // This would be processed by template engine
            html: this.renderTemplate(bulkData.template, bulkData.data),
            trackingId: this.generateTrackingId(),
          };

          const { emailService } = await import('../emailService');
          await emailService.sendEmail(emailOptions);
          this.incrementRateLimit();
          
        } catch (error) {
          console.error(`Failed to send bulk email to ${recipient}:`, error);
          // Continue with other recipients
        }
      }
      
      // Small delay between batches
      await this.delay(1000);
    }
  }

  /**
   * Process reminder job
   */
  private async processReminder(job: EmailQueueJob): Promise<void> {
    const reminderData = job.data as EmailOptions;
    
    // Add reminder-specific logic here
    const { emailService } = await import('../emailService');
    const success = await emailService.sendEmail(reminderData);
    
    if (!success) {
      throw new Error('Failed to send reminder email');
    }
  }

  /**
   * Process follow-up job
   */
  private async processFollowUp(job: EmailQueueJob): Promise<void> {
    const followUpData = job.data as EmailOptions;
    
    // Add follow-up specific logic here
    const { emailService } = await import('../emailService');
    const success = await emailService.sendEmail(followUpData);
    
    if (!success) {
      throw new Error('Failed to send follow-up email');
    }
  }

  /**
   * Handle job failure
   */
  private async handleJobFailure(job: EmailQueueJob, error: Error): Promise<void> {
    job.attempts++;
    job.lastError = error.message;
    job.updatedAt = new Date();

    if (job.attempts >= job.maxAttempts) {
      job.status = 'failed';
      console.error(`Email job permanently failed after ${job.attempts} attempts: ${job.id}`);
      
      // TODO: Send alert to admin about failed job
      await this.notifyJobFailure(job);
    } else {
      job.status = 'pending';
      job.scheduledFor = new Date(Date.now() + this.config.retryDelay * job.attempts);
      console.log(`Email job will be retried (attempt ${job.attempts}/${job.maxAttempts}): ${job.id}`);
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if minute has passed
    if (now >= this.rateLimitResetTime) {
      this.rateLimitCounter = 0;
      this.rateLimitResetTime = now + 60000;
    }
    
    return this.rateLimitCounter < this.config.rateLimitPerMinute;
  }

  /**
   * Increment rate limit counter
   */
  private incrementRateLimit(): void {
    this.rateLimitCounter++;
  }

  /**
   * Insert job by priority
   */
  private insertJobByPriority(job: EmailQueueJob): void {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const jobPriority = priorityOrder[job.priority];
    
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const existingPriority = priorityOrder[this.queue[i].priority];
      if (jobPriority < existingPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, job);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate tracking ID for emails
   */
  private generateTrackingId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Render email template (placeholder implementation)
   */
  private renderTemplate(template: string, data: any): string {
    // This is a simple placeholder. In a real implementation,
    // you'd use a proper template engine like Handlebars or Mustache
    let rendered = template;
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return rendered;
  }

  /**
   * Notify about job failure
   */
  private async notifyJobFailure(job: EmailQueueJob): Promise<void> {
    try {
      // TODO: Send notification to admin about failed job
      console.error('Failed job notification:', {
        jobId: job.id,
        type: job.type,
        attempts: job.attempts,
        lastError: job.lastError,
      });
    } catch (error) {
      console.error('Failed to notify about job failure:', error);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue stats
   */
  getQueueStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const stats = {
      total: this.queue.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    this.queue.forEach(job => {
      stats[job.status]++;
    });

    return stats;
  }

  /**
   * Cancel job
   */
  cancelJob(jobId: string): boolean {
    const job = this.queue.find(j => j.id === jobId);
    if (job && job.status === 'pending') {
      job.status = 'cancelled';
      job.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(job => 
      job.status !== 'completed' && job.status !== 'failed'
    );
    return initialLength - this.queue.length;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): EmailQueueJob | null {
    return this.queue.find(job => job.id === jobId) || null;
  }

  /**
   * Schedule bulk reminder emails
   */
  async scheduleBulkReminders(
    reminders: Array<{
      recipient: string;
      reminderType: '24h' | '1h';
      bookingData: any;
      scheduledFor: Date;
    }>
  ): Promise<string[]> {
    const jobIds: string[] = [];

    for (const reminder of reminders) {
      const jobId = await this.add({
        type: 'reminder',
        data: {
          to: reminder.recipient,
          subject: `Class Reminder - ${reminder.reminderType}`,
          html: '', // Would be generated by template
          trackingId: this.generateTrackingId(),
        },
        priority: reminder.reminderType === '1h' ? 'high' : 'medium',
        scheduledFor: reminder.scheduledFor,
      });

      jobIds.push(jobId);
    }

    return jobIds;
  }
}