-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_env_files_project_id ON env_files(project_id);
CREATE INDEX IF NOT EXISTS idx_env_files_project_env ON env_files(project_id, environment);
CREATE INDEX IF NOT EXISTS idx_env_files_created_at ON env_files(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);