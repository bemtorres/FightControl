export type SceneType = 'INTRO' | 'SELECT' | 'VERSUS' | 'COMBAT' | 'WINNER' | 'PRESENTATION';

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  chroma_key_color: string;
  background_url?: string;
  tournament_logo?: string;
  font_family?: string;
  settings?: {
    is_public?: boolean;
    access_key?: string;
    [key: string]: any;
  };
}

export interface Character {
  id: string;
  scenario_id: string;
  name: string;
  description?: string; // New field
  icon_face: string;       // URL for small icon (circle)
  side_view_combat: string; // URL for transparent PNG in combat
  victory_pose: string;    // URL for winning screen
}

export interface GameState {
  id: string;
  scenario_id: string;
  current_scene: SceneType;
  p1_selected_id: string | null;
  p2_selected_id: string | null;
  p1_cursor_index: number;
  p2_cursor_index: number;
  winner_id: string | null;
  presentation_char_id: string | null;
  p1_locked: boolean;
  p2_locked: boolean;
  allow_duplicates: boolean;
  presentation_cursor_index: number;
}
