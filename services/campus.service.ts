import { createClient } from '@/lib/supabase/server'

export class CampusService {
  /**
   * Matches study groups based on shared interests/courses.
   * Queries the study_groups table and filters by overlapping interests.
   */
  static async matchStudyGroups(userId: string, interests: string[]) {
    try {
      const supabase = await createClient()

      // Fetch all study groups the user is NOT already a member of
      const { data: userGroups } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', userId)

      const joinedGroupIds = (userGroups || []).map((g) => g.group_id)

      let query = supabase
        .from('study_groups')
        .select('*, study_group_members(count)')
        .order('created_at', { ascending: false })

      if (joinedGroupIds.length > 0) {
        query = query.not('id', 'in', `(${joinedGroupIds.join(',')})`)
      }

      // Filter groups that match any of the user's interests via subject/tags overlap
      if (interests.length > 0) {
        query = query.overlaps('tags', interests)
      }

      const { data: matchedGroups, error } = await query

      if (error) throw error

      return matchedGroups || []
    } catch (error) {
      console.error('Study group matching failed:', error)
      throw new Error('Failed to match study groups')
    }
  }

  /**
   * Fetches the presence status for a given user from the presence table.
   */
  static async getPresenceStatus(userId: string) {
    try {
      const supabase = await createClient()

      const { data: presence, error } = await supabase
        .from('presence')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return presence || { status: 'offline', last_seen: null }
    } catch (error) {
      console.error('Presence fetch failed:', error)
      throw new Error('Failed to fetch presence status')
    }
  }

  /**
   * Posts a new entry to the digital noticeboard.
   */
  static async postNoticeboard(
    userId: string,
    title: string,
    message: string,
    type: 'notice' | 'lost_found'
  ) {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('digital_noticeboard')
        .insert({
          user_id: userId,
          title,
          message,
          type,
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Noticeboard post failed:', error)
      throw new Error('Failed to post to noticeboard')
    }
  }

  /**
   * Fetches all noticeboard entries, optionally filtered by type.
   */
  static async getNoticeboardEntries(type?: 'notice' | 'lost_found') {
    try {
      const supabase = await createClient()

      let query = supabase
        .from('digital_noticeboard')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Noticeboard fetch failed:', error)
      throw new Error('Failed to fetch noticeboard entries')
    }
  }

  /**
   * Fetches all safety alerts, ordered by most recent.
   */
  static async getSafetyAlerts() {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('safety_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Safety alerts fetch failed:', error)
      throw new Error('Failed to fetch safety alerts')
    }
  }
}
