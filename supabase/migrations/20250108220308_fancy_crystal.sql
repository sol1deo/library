-- Create a view for auth users
CREATE OR REPLACE VIEW auth_users_view AS
SELECT id, email
FROM auth.users;

-- Grant access to the view
GRANT SELECT ON auth_users_view TO authenticated;