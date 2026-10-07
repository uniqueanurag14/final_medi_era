/**
 * Settings DTOs
 */

export interface UpdateSettingsDto {
  category?: string;
  key?: string;
  value?: any;
  settings?: Record<string, any>;
}

export function validateUpdateSettingsDto(data: any): { valid: boolean; errors: string[]; dto?: UpdateSettingsDto } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }
  return {
    valid: true,
    errors: [],
    dto: data as UpdateSettingsDto,
  };
}
