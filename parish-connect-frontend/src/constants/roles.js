// These values must match the users.role column and Laravel validation.
export const ROLE_OPTIONS = [
    { value: 'parishioner', label: 'Parishioner' },
    { value: 'priest', label: 'Parish Priest' },
    { value: 'secretary', label: 'Parish Secretary' },
    { value: 'ministry_coordinator', label: 'Ministry Coordinator' },
];

export function roleLabel(value) {
    return ROLE_OPTIONS.find((option) => option.value === value)?.label || value || 'Unknown role';
}
