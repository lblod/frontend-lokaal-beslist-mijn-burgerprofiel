import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';

// Sort sessions based on the presence of "municipality" and "startedAt"
export const sortSessions = (a: SessionModel, b: SessionModel) => {
  const hasMunicipalityA = 'municipality' in a;
  const hasMunicipalityB = 'municipality' in b;
  const hasStartedAtA = 'startedAt' in a;
  const hasStartedAtB = 'startedAt' in b;

  // First, sort based on the presence of "municipality"
  if (hasMunicipalityA && !hasMunicipalityB) return -1;
  if (!hasMunicipalityA && hasMunicipalityB) return 1;

  // Then, sort based on the presence of "startedAt"
  if (hasStartedAtA && !hasStartedAtB) return -1;
  if (!hasStartedAtA && hasStartedAtB) return 1;

  // If both objects have or don't have "municipality" and "startedAt", no preference
  return 0;
};
