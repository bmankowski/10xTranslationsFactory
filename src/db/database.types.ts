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
      // Add your database tables here
    }
    Views: {
      // Add your views here
    }
    Functions: {
      // Add your functions here
    }
    Enums: {
      // Add your enums here
    }
  }
}
