export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const KEYS = {
  USERS: 'inat_users',
  OPENINGS: 'inat_openings',
  APPLICATIONS: 'inat_applications',
  MESSAGES: 'inat_messages',
  TEAMS: 'inat_teams',
  CURRENT_USER_ID: 'inat_current_user_id'
};
