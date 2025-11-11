-- Grant admin role to the authenticated user
INSERT INTO public.user_roles (user_id, role)
VALUES ('b20c5f9d-165f-444b-9743-9de2fb9af72c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;