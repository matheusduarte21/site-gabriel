export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      service_calls: {
        Row: {
          id: string
          created_at: string
          datetime: string
          status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado'
          client: string
          ticket_number: string
          analyst: string
          description: string
          equipment: string
          solution: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          datetime: string
          status?: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado'
          client: string
          ticket_number: string
          analyst: string
          description: string
          equipment: string
          solution?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          datetime?: string
          status?: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado'
          client?: string
          ticket_number?: string
          analyst?: string
          description?: string
          equipment?: string
          solution?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      service_call_status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado'
    }
  }
}