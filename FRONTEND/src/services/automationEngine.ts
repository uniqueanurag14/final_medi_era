import { AutomationEvent, AutomationExecution, AutomationRule } from '../types';
import { dbService } from './mockDatabase';
import { CommunicationService, TemplateRenderer } from './communicationProviders';

export class AutomationEngine {
  /**
   * Evaluates rules against an event trigger and executes configured actions idempotently
   */
  public static async processEvent(event: AutomationEvent, entity: any, entityType: AutomationExecution['entityType']): Promise<AutomationExecution[]> {
    const rules = dbService.getAutomationRules().filter((r) => r.status === 'Active' && r.event === event);
    const executions: AutomationExecution[] = [];

    for (const rule of rules) {
      const idempotencyKey = `auto-${rule.id}-${entityType.toLowerCase()}-${entity.id}`;

      // Check for duplicate execution
      const existing = dbService.getAutomationExecutions().find((e) => e.idempotencyKey === idempotencyKey && e.status === 'Completed');
      if (existing) {
        continue;
      }

      // Check conditions
      let conditionsMet = true;
      if (rule.conditions && rule.conditions.length > 0) {
        for (const cond of rule.conditions) {
          const val = entity[cond.field];
          if (cond.operator === 'equals' && val !== cond.value) conditionsMet = false;
          if (cond.operator === 'greater_than' && Number(val) <= Number(cond.value)) conditionsMet = false;
          if (cond.operator === 'less_than' && Number(val) >= Number(cond.value)) conditionsMet = false;
          if (cond.operator === 'is_true' && !val) conditionsMet = false;
        }
      }

      if (!conditionsMet) {
        continue;
      }

      const execution: AutomationExecution = {
        id: `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        event,
        entityId: entity.id,
        entityType,
        idempotencyKey,
        executedAt: new Date().toISOString(),
        status: 'Running',
        details: `Executing rule "${rule.name}" for ${entityType} #${entity.id}`,
      };

      try {
        await this.executeAction(rule, entity, entityType);
        execution.status = 'Completed';
        execution.details = `Successfully executed action [${rule.action}] for ${entityType} #${entity.id}`;
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        dbService.updateAutomationRule(rule.id, { triggerCount: rule.triggerCount });
      } catch (err: any) {
        execution.status = 'Failed';
        execution.error = err?.message || 'Unknown execution error';
        execution.details = `Failed to execute action [${rule.action}]: ${execution.error}`;
      }

      dbService.addAutomationExecution(execution);
      executions.push(execution);
    }

    return executions;
  }

  private static async executeAction(rule: AutomationRule, entity: any, entityType: AutomationExecution['entityType']) {
    const today = new Date().toISOString().split('T')[0];

    switch (rule.action) {
      case 'create_followup': {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (rule.delayDays || 7));
        const dueDateStr = dueDate.toISOString().split('T')[0];

        dbService.addFollowUp({
          patientId: entity.patientId || entity.id,
          patientName: entity.patientName || `${entity.firstName} ${entity.lastName}`,
          patientPhone: entity.patientPhone || entity.phone || '',
          type: 'Consultation Follow-up',
          date: dueDateStr,
          assignedDoctorOrStaff: entity.doctorName || 'Dr. Sarah Jenkins, MD',
          status: 'Pending',
          notes: `Auto-generated follow-up after ${rule.event} (Rule: ${rule.name})`,
        });
        break;
      }

      case 'create_recovery_task': {
        const due = new Date();
        due.setHours(due.getHours() + (rule.delayHours || 24));
        dbService.addCrmTask({
          title: `No-Show / Service Recovery: ${entity.patientName || entity.name}`,
          category: 'No-Show Recovery',
          assignedUserId: 'usr-stf-03',
          assignedUserName: 'Rachel Gomez',
          patientId: entity.patientId || entity.id,
          patientName: entity.patientName || `${entity.firstName} ${entity.lastName}`,
          patientPhone: entity.patientPhone || entity.phone,
          dueDate: due.toISOString().split('T')[0],
          priority: 'Urgent',
          status: 'Pending',
          notes: `Follow up to reschedule missed appointment / review concern. Triggered by ${rule.event}`,
        });
        break;
      }

      case 'create_task': {
        dbService.addCrmTask({
          title: `Task: ${rule.name} - ${entity.patientName || entity.name || entity.invoiceNumber}`,
          category: 'General',
          assignedUserId: 'usr-stf-02',
          assignedUserName: 'Jennifer Collins',
          patientId: entity.patientId || (entityType === 'Patient' ? entity.id : undefined),
          patientName: entity.patientName,
          dueDate: today,
          priority: 'Normal',
          status: 'Pending',
          notes: `Automated CRM workflow task. Condition matched on ${rule.event}.`,
        });
        break;
      }

      case 'send_payment_reminder': {
        const patient = dbService.getPatientById(entity.patientId);
        if (patient) {
          const templates = dbService.getCommunicationTemplates();
          const template = templates.find((t) => t.eventTrigger === 'invoice.overdue' || t.name.includes('Payment')) || templates[0];
          const content = TemplateRenderer.render(template?.body || 'Dear {{patient_name}}, please settle your pending balance of ${{amount}} for invoice {{invoice_number}}.', {
            patient_name: `${patient.firstName} ${patient.lastName}`,
            invoice_number: entity.invoiceNumber,
            amount: entity.balanceAmount || entity.grandTotal,
            clinic_name: 'Apex Healthcare Clinic',
          });

          await CommunicationService.dispatchMessage({
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            recipient: patient.phone || patient.email,
            channel: 'WhatsApp',
            templateName: template?.name || 'Invoice Payment Reminder',
            eventTrigger: 'invoice.overdue',
            content,
          });
        }
        break;
      }

      case 'send_notification': {
        dbService.addNotification({
          targetRole: 'CLINIC_ADMIN',
          title: `Automated Alert: ${rule.name}`,
          message: `Event ${rule.event} triggered for ${entityType} #${entity.id}.`,
          type: 'system',
        });
        break;
      }

      default:
        break;
    }
  }

  public static async trigger(
    event: any,
    payload: any
  ): Promise<{ ruleName: string; actionsExecuted: string[]; status: string }[]> {
    const matchedRules = dbService
      .getAutomationRules()
      .filter((r) => (r.status === 'Active' || r.isActive) && (r.event === event || r.triggerEvent === event));

    const results: { ruleName: string; actionsExecuted: string[]; status: string }[] = [];

    for (const rule of matchedRules) {
      try {
        const actionNames = rule.actions && rule.actions.length > 0 
          ? rule.actions.map((a) => a.type) 
          : [rule.action || 'Default Action'];
        
        await AutomationEngine.executeAction(rule, payload, 'Patient');
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        dbService.updateAutomationRule(rule.id, { triggerCount: rule.triggerCount });

        results.push({
          ruleName: rule.name,
          actionsExecuted: actionNames,
          status: 'Success',
        });
      } catch (err: any) {
        results.push({
          ruleName: rule.name,
          actionsExecuted: [rule.action || 'Default Action'],
          status: 'Failed',
        });
      }
    }

    return results;
  }
}

export const automationEngine = {
  trigger: AutomationEngine.trigger.bind(AutomationEngine),
  processEvent: AutomationEngine.processEvent.bind(AutomationEngine),
};

