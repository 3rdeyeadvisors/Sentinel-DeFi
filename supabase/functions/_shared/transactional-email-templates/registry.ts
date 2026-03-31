/// <reference types="npm:@types/react@18.3.1" />

import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry<P = Record<string, unknown>> {
  component: ComponentType<P>
  subject: string | ((props: P) => string)
  displayName?: string
  previewData?: P
  to?: (props: P) => string
}

// Register transactional email templates here.
// Each key is the templateName used when invoking send-transactional-email.
export const TEMPLATES: Record<string, TemplateEntry<any>> = {
  // Add templates here, e.g.:
  // 'contact-confirmation': contactConfirmationTemplate,
}
