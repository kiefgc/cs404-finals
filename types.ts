export interface User {
  user_id?: number;
  name: string;
  email?: string;
  pass_hash?: string;
  bio: string;
  handle?: string;
  role?: string;
  location?: string;
  joined?: string;
  gamesCount?: number;
  reviewsCount?: number;
  followersCount?: number;
  profile_pic?: string;
  created_at?: string;
  liked_games?: number[];
}

export interface Game {
  game_id: number;
  title: string;
  release_date: string;
  rating_avg: number;
  descript: string;
  genre_name?: string;
  image_url?: string;
}

export interface Review {
  review_id: number;
  game_id?: number;
  game_title: string;
  review_title: string;
  body: string;
  rating?: number;
  recommended: boolean;
  user_id?: number;
  user_name?: string;
  date_created?: string;
  likes_count?: number;
  game_cover_image?: string | null;
}