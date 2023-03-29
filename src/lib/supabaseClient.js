import { createClient } from '@supabase/supabase-js'

const projectUrl = 'https://zjttwxnuqztzyoscmnvm.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdHR3eG51cXp0enlvc2NtbnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwODAyNDgsImV4cCI6MTk5NTY1NjI0OH0.hp-cP2cNshgQfPt-Ftfr7Q1uKmtNuo9zCD2aoIr395w'

export const supabase = createClient(projectUrl, anonKey)
