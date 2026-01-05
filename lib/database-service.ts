import { supabase } from './supabase'; 
import { UserProfile, Conversation, Message } from './supabase'; 

class DatabaseService { 
  // Usuarios 
  async createUserProfile(id: string, name: string, email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id, name, email, preferences: {}, created_at: new Date().toISOString(), last_active: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    return data;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> { 
    const { data, error } = await supabase 
      .from('users') 
      .select('*') 
      .eq('id', userId) 
      .single(); 

    if (error) { 
      // Ignoramos el error si es solo que no existe filas, pero logueamos otros
      if (error.code !== 'PGRST116') {
          console.error('Error getting user profile:', error); 
      }
      return null; 
    } 
    return data; 
  } 

  async updateUserPreferences(userId: string, preferences: Record<string, any>) { 
    const { error } = await supabase 
      .from('users') 
      .update({ 
        preferences, 
        last_active: new Date().toISOString() 
      }) 
      .eq('id', userId); 

    if (error) { 
      console.error('Error updating preferences:', error); 
    } 
  } 

  // Conversaciones 
  async createConversation(userId: string, title: string): Promise<Conversation | null> { 
    const { data, error } = await supabase 
      .from('conversations') 
      .insert([{ user_id: userId, title }]) 
      .select() 
      .single(); 

    if (error) { 
      console.error('Error creating conversation:', error); 
      return null; 
    } 
    return data; 
  } 

  async getUserConversations(userId: string): Promise<Conversation[]> { 
    const { data, error } = await supabase 
      .from('conversations') 
      .select('*') 
      .eq('user_id', userId) 
      .order('updated_at', { ascending: false }); 

    if (error) { 
      console.error('Error getting conversations:', error); 
      return []; 
    } 
    return data || []; 
  } 

  // Mensajes 
  async saveMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> { 
    const { data, error } = await supabase 
      .from('messages') 
      .insert([message]) 
      .select() 
      .single(); 

    if (error) { 
      console.error('Error saving message:', error); 
      return null; 
    } 
    
    // Actualizar timestamp de la conversación 
    await supabase 
      .from('conversations') 
      .update({ updated_at: new Date().toISOString() }) 
      .eq('id', message.conversation_id); 

    return data; 
  } 

  async getConversationMessages(conversationId: string): Promise<Message[]> { 
    const { data, error } = await supabase 
      .from('messages') 
      .select('*') 
      .eq('conversation_id', conversationId) 
      .order('created_at', { ascending: true }); 

    if (error) { 
      console.error('Error getting messages:', error); 
      return []; 
    } 
    return data || []; 
  } 
} 

export const db = new DatabaseService();