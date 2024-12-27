/*
  # Create employees and tasks tables

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `role` (text)
      - `phone` (text)
      - `tasks` (jsonb array)
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on `employees` table
    - Add policies for admin and employees
*/

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  phone text,
  tasks jsonb[] DEFAULT array[]::jsonb[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access"
  ON employees
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@techservice.com.br'
  ));

-- Employees can only read their own data
CREATE POLICY "Employees can read own data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);