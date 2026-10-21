'use client';

// Generated-free entry: the react-hook-form + zod adapter of the fields (MAIR-608).
// It lives outside src/components so that the primitives entry never imports the optional peers.
export { Form, useZodForm } from './Form';
export type { FormProps } from './Form';
export { FormField, fieldErrorMessage } from './FormField';
export type { FormFieldProps, FormFieldRenderProps } from './FormField';
