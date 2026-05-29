import { apiRequest } from './client';
import type { AuthUser } from '@/types/auth';

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface BudgetPreferencesDto {
  budgetAutomation: boolean;
}

export interface BudgetPreferences {
  budgetAutomation: boolean;
}

export function updateProfile(dto: UpdateProfileDto) {
  return apiRequest<AuthUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function changePassword(dto: ChangePasswordDto) {
  return apiRequest<void>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function getBudgetPreferences() {
  return apiRequest<BudgetPreferences>('/users/me/preferences');
}

export function updateBudgetPreferences(dto: BudgetPreferencesDto) {
  return apiRequest<BudgetPreferences>('/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function deleteAccount() {
  return apiRequest<void>('/users/me', {
    method: 'DELETE',
  });
}
