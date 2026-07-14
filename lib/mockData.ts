import { Game, Review, User } from '@/types';

export const USERS: User[] = [
  {
    user_id: 1,
    name: 'Julian Vance',
    handle: '@julianvance',
    role: 'Curator of hidden games and architectural narratives',
    bio: 'Investigating the cultural intersection of game design and digital sociology through reflective reviews, personal favorites, and curated commentary.',
    location: 'Portland, OR',
    joined: 'Joined March 2023',
    gamesCount: 482,
    reviewsCount: 124,
    followersCount: 2100,
    profile_pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    liked_games: [201, 204, 207, 213],
  },
  {
    user_id: 2,
    name: 'Mina Alvarez',
    handle: '@mina.ava',
    role: 'Narrative systems designer',
    bio: 'Obsessed with the emotional architecture of choice-driven stories and worldbuilding.',
    location: 'Austin, TX',
    joined: 'Joined June 2022',
    gamesCount: 310,
    reviewsCount: 88,
    followersCount: 1420,
    profile_pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    liked_games: [202, 205, 209, 214],
  },
  {
    user_id: 3,
    name: 'Darius Cole',
    handle: '@dariusplays',
    role: 'Indie strategy enthusiast',
    bio: 'Scanning the boundary between mechanics and mood, especially in small-team releases.',
    location: 'Chicago, IL',
    joined: 'Joined January 2024',
    gamesCount: 198,
    reviewsCount: 57,
    followersCount: 901,
    profile_pic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    liked_games: [203, 206, 210, 215],
  },
  {
    user_id: 4,
    name: 'Sage Morgan',
    handle: '@sagemorgan',
    role: 'Atmospheric exploration reviewer',
    bio: 'Most interested in how sound, space, and pacing shape the feeling of a place.',
    location: 'Seattle, WA',
    joined: 'Joined September 2021',
    gamesCount: 265,
    reviewsCount: 73,
    followersCount: 1180,
    profile_pic: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
    liked_games: [204, 208, 211, 214],
  },
  {
    user_id: 5,
    name: 'Noah Bennett',
    handle: '@noahb',
    role: 'Combat and systems analyst',
    bio: 'Looking for games that turn systems into stories and fights into meaning.',
    location: 'Denver, CO',
    joined: 'Joined November 2023',
    gamesCount: 154,
    reviewsCount: 41,
    followersCount: 668,
    profile_pic: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
    liked_games: [201, 203, 205, 212],
  },
  {
    user_id: 6,
    name: 'Priya Shah',
    handle: '@priyashah',
    role: 'Art direction and world design writer',
    bio: 'Believes the best games are visual poems that happen to be interactive.',
    location: 'Miami, FL',
    joined: 'Joined April 2020',
    gamesCount: 353,
    reviewsCount: 97,
    followersCount: 1604,
    profile_pic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    liked_games: [206, 209, 213, 215],
  },
  {
    user_id: 7,
    name: 'Leo Park',
    handle: '@leopark',
    role: 'Platformer and challenge curator',
    bio: 'Lives for clever level design, precise timing, and games with a lot of heart.',
    location: 'San Diego, CA',
    joined: 'Joined February 2022',
    gamesCount: 221,
    reviewsCount: 64,
    followersCount: 1044,
    profile_pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    liked_games: [202, 207, 211, 214],
  },
  {
    user_id: 8,
    name: 'Amara Singh',
    handle: '@amarasings',
    role: 'Experimental game essayist',
    bio: 'Interested in how play can be a form of philosophy as much as entertainment.',
    location: 'New York, NY',
    joined: 'Joined July 2023',
    gamesCount: 176,
    reviewsCount: 49,
    followersCount: 789,
    profile_pic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    liked_games: [201, 208, 212, 215],
  },
  {
    user_id: 9,
    name: 'Evan Brooks',
    handle: '@evanb',
    role: 'JRPG and story structure follower',
    bio: 'Hunting for emotional peaks, memorable characters, and stories that linger.',
    location: 'Boston, MA',
    joined: 'Joined October 2022',
    gamesCount: 287,
    reviewsCount: 81,
    followersCount: 1322,
    profile_pic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    liked_games: [203, 207, 210, 213],
  },
  {
    user_id: 10,
    name: 'Talia Cruz',
    handle: '@taliacruz',
    role: 'Sci-fi and simulation writer',
    bio: 'Drawn to games that make systems feel alive and futures feel tangible.',
    location: 'Phoenix, AZ',
    joined: 'Joined March 2024',
    gamesCount: 143,
    reviewsCount: 38,
    followersCount: 610,
    profile_pic: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=400&q=80',
    liked_games: [204, 205, 211, 214],
  },
];

export const GAMES: Game[] = [
  { game_id: 201, title: 'Sovereign\'s Descent', release_date: '2024-12-04', rating_avg: 8.7, descript: 'A haunting narrative adventure about memory, ritual, and the cost of divine ambition.', genre_name: 'Narrative Adventure' },
  { game_id: 202, title: 'Syntax Error: Vol. 2', release_date: '2024-11-21', rating_avg: 8.3, descript: 'A neon-soaked cyber puzzle experience that turns glitches into gameplay.', genre_name: 'Puzzle' },
  { game_id: 203, title: 'Neon Nihilism', release_date: '2024-10-18', rating_avg: 7.6, descript: 'A stylish dystopian shooter that trades comfort for spectacle and danger.', genre_name: 'Action' },
  { game_id: 204, title: 'Lumen Drift', release_date: '2024-09-12', rating_avg: 8.9, descript: 'An atmospheric exploration journey through luminous ruins and fractured time.', genre_name: 'Exploration' },
  { game_id: 205, title: 'Velvet Circuit', release_date: '2024-08-05', rating_avg: 8.1, descript: 'A synth-pop racing game with a bold visual identity and surprising depth.', genre_name: 'Racing' },
  { game_id: 206, title: 'Ashen Harbor', release_date: '2024-07-22', rating_avg: 8.4, descript: 'A moody survival adventure set in a city reclaimed by tide and shadow.', genre_name: 'Survival' },
  { game_id: 207, title: 'Orbit Zero', release_date: '2024-06-14', rating_avg: 9.0, descript: 'A polished sci-fi platformer where gravity bends around your choices.', genre_name: 'Platformer' },
  { game_id: 208, title: 'Midnight Orchard', release_date: '2024-05-09', rating_avg: 7.9, descript: 'A dreamlike farming sim that turns seasons into emotional storytelling.', genre_name: 'Simulation' },
  { game_id: 209, title: 'Echoes of Glass', release_date: '2023-11-03', rating_avg: 8.6, descript: 'A reflective puzzle adventure where memory fragments become the map.', genre_name: 'Puzzle' },
  { game_id: 210, title: 'Mothlight Parade', release_date: '2023-08-16', rating_avg: 8.2, descript: 'A tender management game about caretaking and community in an insect city.', genre_name: 'Management' },
  { game_id: 211, title: 'Sunken Atlas', release_date: '2023-04-27', rating_avg: 8.8, descript: 'An oceanic exploration game about charting lost civilizations beneath the waves.', genre_name: 'Exploration' },
  { game_id: 212, title: 'Crimson Relay', release_date: '2022-12-11', rating_avg: 7.7, descript: 'A rapid-fire arcade shooter with a stylish undercurrent of melancholy.', genre_name: 'Action' },
  { game_id: 213, title: 'Mosaic Tides', release_date: '2022-07-19', rating_avg: 8.5, descript: 'An emotional city-builder where every district tells a different story.', genre_name: 'Strategy' },
  { game_id: 214, title: 'Vanta Reach', release_date: '2021-11-02', rating_avg: 9.1, descript: 'A cyberpunk survival odyssey about isolation, machines, and meaning.', genre_name: 'Survival' },
  { game_id: 215, title: 'The Hollow Garden', release_date: '2021-03-18', rating_avg: 8.0, descript: 'A meditative gardening sim that reframes seasons as emotional milestones.', genre_name: 'Simulation' },
  { game_id: 216, title: "Eco", release_date: '2021-03-23', rating_avg: 7.5, descript: "A farming simulation with a focus on eco-friendly practices and community building.", genre_name: 'Simulation' },
  { game_id: 217, title: 'Staxel', release_date: '2018-05-22', rating_avg: 8.2, descript: 'A voxel-based sandbox where you\'re the owner of a blocky farm.', genre_name: 'Simulation' },
  { game_id: 218, title: 'Rune Factory 4 Special', release_date: '2020-02-25', rating_avg: 7.8, descript: "Action-RPG farming sim where you'll explore dungeons and build a life.", genre_name: 'Simulation' },
  { game_id: 219, title: 'Harvest Moon: Light of Hope', release_date: '2017-11-07', rating_avg: 8.1, descript: "Restore your town, romance the locals, and rebuild your farm in this farming sim.", genre_name: 'Simulation' },
  { game_id: 220, title: 'My Time at Portia', release_date: '2018-12-06', rating_avg: 7.9, descript: "Build your workshop, help customers, and explore dungeons in this blend of farming and crafting.", genre_name: 'Simulation' }
];

export const REVIEWS: Review[] = [
  { review_id: 1, game_id: 201, game_title: "Sovereign's Descent", review_title: 'The architecture of absence', body: 'A deeply restrained piece of interactive storytelling that invites patience and reflection.', rating: 5, recommended: true, user_id: 1, user_name: 'Julian Vance', date_created: '2024-12-10', likes_count: 342 },
  { review_id: 2, game_id: 202, game_title: 'Syntax Error: Vol. 2', review_title: 'Glitches turned into meaning', body: 'This game takes its own technical imperfections and transforms them into unforgettable design language.', rating: 4, recommended: true, user_id: 2, user_name: 'Mina Alvarez', date_created: '2024-12-08', likes_count: 218 },
  { review_id: 3, game_id: 203, game_title: 'Neon Nihilism', review_title: 'A brilliant mess of style', body: 'The atmosphere is immaculate, even if the story occasionally feels more interested in attitude than depth.', rating: 3, recommended: false, user_id: 3, user_name: 'Darius Cole', date_created: '2024-12-04', likes_count: 156 },
  { review_id: 4, game_id: 204, game_title: 'Lumen Drift', review_title: 'Stillness made cinematic', body: 'Every quiet moment here feels deliberate, as though the game is teaching you how to breathe.', rating: 5, recommended: true, user_id: 4, user_name: 'Sage Morgan', date_created: '2024-11-29', likes_count: 271 },
  { review_id: 5, game_id: 205, game_title: 'Velvet Circuit', review_title: 'A racer with real heart', body: 'The music and movement are stylish, but the emotional arc is what really sticks with me.', rating: 4, recommended: true, user_id: 5, user_name: 'Noah Bennett', date_created: '2024-11-22', likes_count: 194 },
  { review_id: 6, game_id: 206, game_title: 'Ashen Harbor', review_title: 'A city that feels haunted', body: 'It is wonderfully atmospheric, but the pacing can leave you emotionally stranded at times.', rating: 4, recommended: true, user_id: 6, user_name: 'Priya Shah', date_created: '2024-11-18', likes_count: 176 },
  { review_id: 7, game_id: 207, game_title: 'Orbit Zero', review_title: 'Graceful, exact, and unforgettable', body: 'What it lacks in surprise it more than makes up for in clean, confident execution.', rating: 5, recommended: true, user_id: 7, user_name: 'Leo Park', date_created: '2024-11-12', likes_count: 303 },
  { review_id: 8, game_id: 208, game_title: 'Midnight Orchard', review_title: 'Tender and strange', body: 'Its oddness is what makes it work; every small interaction feels emotionally charged.', rating: 4, recommended: true, user_id: 8, user_name: 'Amara Singh', date_created: '2024-10-31', likes_count: 139 },
  { review_id: 9, game_id: 209, game_title: 'Echoes of Glass', review_title: 'Memory as a mechanic', body: 'This is the sort of puzzle game that turns every solved fragment into a personal revelation.', rating: 4, recommended: true, user_id: 9, user_name: 'Evan Brooks', date_created: '2024-10-14', likes_count: 183 },
  { review_id: 10, game_id: 210, game_title: 'Mothlight Parade', review_title: 'Small-scale wonder', body: 'It is cozy, clever, and more moving than its premise suggests.', rating: 5, recommended: true, user_id: 10, user_name: 'Talia Cruz', date_created: '2024-09-28', likes_count: 211 },
  { review_id: 11, game_id: 211, game_title: 'Sunken Atlas', review_title: 'Adventure with weight', body: 'The exploration is beautiful, but the best part is how every discovery feels earned.', rating: 4, recommended: true, user_id: 1, user_name: 'Julian Vance', date_created: '2024-09-05', likes_count: 168 },
  { review_id: 12, game_id: 212, game_title: 'Crimson Relay', review_title: 'Fast and a little lonely', body: 'The game is stylish and efficient, but the emotional temperature stays cool throughout.', rating: 3, recommended: false, user_id: 2, user_name: 'Mina Alvarez', date_created: '2024-08-21', likes_count: 124 },
  { review_id: 13, game_id: 213, game_title: 'Mosaic Tides', review_title: 'A city-builder with a pulse', body: 'Every district feels inhabited, and the systems quietly create a sense of history.', rating: 5, recommended: true, user_id: 3, user_name: 'Darius Cole', date_created: '2024-07-17', likes_count: 251 },
  { review_id: 14, game_id: 214, game_title: 'Vanta Reach', review_title: 'The future feels fragile', body: 'It is one of the strongest survival games I have seen in years, but it is not easy to love.', rating: 4, recommended: true, user_id: 4, user_name: 'Sage Morgan', date_created: '2024-06-30', likes_count: 289 },
  { review_id: 15, game_id: 215, game_title: 'The Hollow Garden', review_title: 'Quiet wisdom', body: 'A modest game that builds intimacy through texture, routine, and gentle progression.', rating: 4, recommended: true, user_id: 5, user_name: 'Noah Bennett', date_created: '2024-06-12', likes_count: 147 },
  { review_id: 16, game_id: 201, game_title: "Sovereign's Descent", review_title: 'A ritual of memory', body: 'The pacing feels almost ceremonial, and that restraint makes each revelation land harder.', rating: 5, recommended: true, user_id: 1, user_name: 'Julian Vance', date_created: '2026-06-28', likes_count: 318 },
  { review_id: 17, game_id: 201, game_title: "Sovereign's Descent", review_title: 'Quietly devastating', body: 'It never overplays its hand; instead, it lets the sorrow breathe through the environment.', rating: 4, recommended: true, user_id: 6, user_name: 'Priya Shah', date_created: '2026-06-17', likes_count: 221 },
  { review_id: 18, game_id: 202, game_title: 'Syntax Error: Vol. 2', review_title: 'The code of feeling', body: 'I admired how the interface glitches became emotional beats rather than mere quirks.', rating: 4, recommended: true, user_id: 2, user_name: 'Mina Alvarez', date_created: '2026-06-10', likes_count: 246 },
  { review_id: 19, game_id: 202, game_title: 'Syntax Error: Vol. 2', review_title: 'Clever but slightly cold', body: 'It is stylish and inventive, though I wanted a touch more warmth in the final act.', rating: 3, recommended: false, user_id: 8, user_name: 'Amara Singh', date_created: '2026-05-29', likes_count: 143 },
  { review_id: 20, game_id: 203, game_title: 'Neon Nihilism', review_title: 'A gorgeous fever dream', body: 'Every frame feels charged with attitude, and the combat hits with real confidence.', rating: 4, recommended: true, user_id: 3, user_name: 'Darius Cole', date_created: '2026-05-24', likes_count: 198 },
  { review_id: 21, game_id: 203, game_title: 'Neon Nihilism', review_title: 'Style over substance', body: 'The presentation is dazzling, but the narrative never quite earns the intensity it reaches for.', rating: 2, recommended: false, user_id: 9, user_name: 'Evan Brooks', date_created: '2026-05-14', likes_count: 121 },
  { review_id: 22, game_id: 204, game_title: 'Lumen Drift', review_title: 'A meditative masterpiece', body: 'It transforms wandering into something almost devotional, and I loved every second of it.', rating: 5, recommended: true, user_id: 4, user_name: 'Sage Morgan', date_created: '2026-05-06', likes_count: 287 },
  { review_id: 23, game_id: 205, game_title: 'Velvet Circuit', review_title: 'High-speed tenderness', body: 'This is one of the rare racers that made me care about the people behind the machines.', rating: 4, recommended: true, user_id: 5, user_name: 'Noah Bennett', date_created: '2026-04-30', likes_count: 172 },
  { review_id: 24, game_id: 206, game_title: 'Ashen Harbor', review_title: 'A storm of atmosphere', body: 'The city feels alive in the strangest way, and each district carries a distinct emotional weather.', rating: 4, recommended: true, user_id: 10, user_name: 'Talia Cruz', date_created: '2026-04-22', likes_count: 164 },
  { review_id: 25, game_id: 207, game_title: 'Orbit Zero', review_title: 'Elegant platforming', body: 'The movement is so precise that even the simplest rooms feel carefully choreographed.', rating: 5, recommended: true, user_id: 7, user_name: 'Leo Park', date_created: '2026-04-15', likes_count: 292 },
  { review_id: 26, game_id: 208, game_title: 'Midnight Orchard', review_title: 'Dreamlike and humane', body: 'It balances whimsy with ache better than many games twice its size.', rating: 4, recommended: true, user_id: 8, user_name: 'Amara Singh', date_created: '2026-04-08', likes_count: 159 },
  { review_id: 27, game_id: 209, game_title: 'Echoes of Glass', review_title: 'Fragile and unforgettable', body: 'The puzzle structure is elegant, but it is the emotional echoes that stay with me.', rating: 5, recommended: true, user_id: 9, user_name: 'Evan Brooks', date_created: '2026-03-31', likes_count: 209 },
  { review_id: 28, game_id: 210, game_title: 'Mothlight Parade', review_title: 'A tiny world with real heart', body: 'Its small-scale focus makes every act of care feel meaningful.', rating: 5, recommended: true, user_id: 1, user_name: 'Julian Vance', date_created: '2026-03-22', likes_count: 231 },
  { review_id: 29, game_id: 211, game_title: 'Sunken Atlas', review_title: 'Discovery with depth', body: 'I appreciated how each new location felt like a historical artifact instead of a backdrop.', rating: 4, recommended: true, user_id: 2, user_name: 'Mina Alvarez', date_created: '2026-03-16', likes_count: 186 },
  { review_id: 30, game_id: 212, game_title: 'Crimson Relay', review_title: 'Fast, sharp, and a bit hollow', body: 'It knows exactly how to move, but it never quite reaches emotional resonance.', rating: 3, recommended: false, user_id: 5, user_name: 'Noah Bennett', date_created: '2026-03-09', likes_count: 132 },
  { review_id: 31, game_id: 213, game_title: 'Mosaic Tides', review_title: 'Systems that feel lived in', body: 'Every civic choice seems to carry the weight of a whole neighborhood behind it.', rating: 5, recommended: true, user_id: 3, user_name: 'Darius Cole', date_created: '2026-02-27', likes_count: 263 },
  { review_id: 32, game_id: 214, game_title: 'Vanta Reach', review_title: 'Bleak in the best way', body: 'It is as uncompromising as it is beautiful, which makes it hard to forget.', rating: 4, recommended: true, user_id: 6, user_name: 'Priya Shah', date_created: '2026-02-18', likes_count: 274 },
  { review_id: 33, game_id: 215, game_title: 'The Hollow Garden', review_title: 'A gentle kind of power', body: 'The game understands how to turn ordinary routines into quiet emotional stakes.', rating: 4, recommended: true, user_id: 10, user_name: 'Talia Cruz', date_created: '2026-02-08', likes_count: 151 },
  { review_id: 34, game_id: 204, game_title: 'Lumen Drift', review_title: 'Atmosphere with purpose', body: 'The silence between moments feels intentional, and the whole experience is richer for it.', rating: 5, recommended: true, user_id: 7, user_name: 'Leo Park', date_created: '2026-01-28', likes_count: 208 },
  { review_id: 35, game_id: 205, game_title: 'Velvet Circuit', review_title: 'More than a style piece', body: 'Beneath the glamour, there is a surprisingly tender story about ambition and burnout.', rating: 4, recommended: true, user_id: 4, user_name: 'Sage Morgan', date_created: '2026-01-19', likes_count: 177 },
  { review_id: 36, game_id: 206, game_title: 'Ashen Harbor', review_title: 'Tidal melancholy', body: 'The world feels soaked in memory, and I admired how the game never rushed its emotional payoff.', rating: 4, recommended: true, user_id: 8, user_name: 'Amara Singh', date_created: '2026-01-12', likes_count: 169 },
  { review_id: 37, game_id: 207, game_title: 'Orbit Zero', review_title: 'Polished to a fault', body: 'Its confidence is so complete that even the quieter sections feel purposeful.', rating: 5, recommended: true, user_id: 2, user_name: 'Mina Alvarez', date_created: '2026-01-05', likes_count: 301 },
  { review_id: 38, game_id: 208, game_title: 'Midnight Orchard', review_title: 'Strange in the best way', body: 'The unusual tone makes the emotional beats land with extra force.', rating: 4, recommended: true, user_id: 9, user_name: 'Evan Brooks', date_created: '2025-12-29', likes_count: 148 },
  { review_id: 39, game_id: 209, game_title: 'Echoes of Glass', review_title: 'A thoughtful puzzle companion', body: 'It asks you to linger, and that patience rewards you with one of the year’s most intimate mechanics.', rating: 4, recommended: true, user_id: 1, user_name: 'Julian Vance', date_created: '2025-12-21', likes_count: 194 },
  { review_id: 40, game_id: 210, game_title: 'Mothlight Parade', review_title: 'Cozy with a pulse', body: 'The management systems are satisfying, but the real strength is the warmth of the cast.', rating: 5, recommended: true, user_id: 6, user_name: 'Priya Shah', date_created: '2025-12-13', likes_count: 226 },
  { review_id: 41, game_id: 211, game_title: 'Sunken Atlas', review_title: 'An expedition worth taking', body: 'I loved how the earliest discoveries felt like genuine revelations rather than obvious landmarks.', rating: 4, recommended: true, user_id: 3, user_name: 'Darius Cole', date_created: '2025-12-05', likes_count: 181 },
  { review_id: 42, game_id: 212, game_title: 'Crimson Relay', review_title: 'Sharp but emotionally distant', body: 'The pacing is excellent, yet the game never quite lets its characters become more than silhouettes.', rating: 3, recommended: false, user_id: 7, user_name: 'Leo Park', date_created: '2025-11-28', likes_count: 129 },
  { review_id: 43, game_id: 213, game_title: 'Mosaic Tides', review_title: 'A city-builder with memory', body: 'It has the rare quality of making every upgrade feel like part of a larger civic story.', rating: 5, recommended: true, user_id: 4, user_name: 'Sage Morgan', date_created: '2025-11-20', likes_count: 255 },
  { review_id: 44, game_id: 214, game_title: 'Vanta Reach', review_title: 'An oppressive masterpiece', body: 'The world is so confidently bleak that even the quiet scenes feel loaded with consequence.', rating: 4, recommended: true, user_id: 10, user_name: 'Talia Cruz', date_created: '2025-11-11', likes_count: 268 },
  { review_id: 45, game_id: 215, game_title: 'The Hollow Garden', review_title: 'Gentle systems, lasting impact', body: 'It is one of the few games that made me care about maintenance as much as discovery.', rating: 5, recommended: true, user_id: 5, user_name: 'Noah Bennett', date_created: '2025-11-02', likes_count: 158 },
];

export const getUserById = (id: number | string) => USERS.find((user) => user.user_id === Number(id)) ?? USERS[0];
export const getGameById = (id: number | string) => GAMES.find((game) => game.game_id === Number(id)) ?? GAMES[0];
export const getReviewById = (id: number | string) => REVIEWS.find((review) => review.review_id === Number(id)) ?? REVIEWS[0];
export const getUserLikedGames = (id: number | string) => {
  const user = getUserById(id);
  const likedIds = user.liked_games ?? [];
  return GAMES.filter((game) => likedIds.includes(game.game_id));
};

export const getReviewsByUserId = (id: number | string, count = 3) => {
  const reviews = sortByDateDesc(
    REVIEWS.filter((review) => review.user_id === Number(id)),
    'date_created' as keyof Review,
  );

  return reviews.slice(0, count);
};

export const getReviewsForGame = (gameId: number | string, count = 2) => {
  const reviews = sortByDateDesc(
    REVIEWS.filter((review) => review.game_id === Number(gameId)),
    'date_created' as keyof Review,
  );

  return reviews.slice(0, count);
};

export const getGameReviews = (gameId: number | string) => getReviewsForGame(gameId);

export const getReviewDetailById = (id: number | string) => {
  const review = getReviewById(id);
  const game = getGameById(review.game_id ?? 0);

  return {
    ...review,
    game_info: {
      release_date: game.release_date,
      rating_avg: game.rating_avg,
      description: game.descript,
    },
    related_reviews: getReviewsForGame(review.game_id ?? 0, 5).filter((item) => item.review_id !== review.review_id),
  };
};

export const getGameDetailById = (id: number | string) => {
  const game = getGameById(id);
  const reviews = getGameReviews(game.game_id).map((review) => ({
    id: review.review_id,
    user: review.user_name ?? 'Anonymous',
    recommended: review.recommended,
    upvotes: review.likes_count ?? 0,
    text: review.body,
    time: review.date_created ? `POSTED ${new Date(review.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'POSTED RECENTLY',
  }));

  return {
    title: game.title,
    release_date: game.release_date,
    rating_avg: game.rating_avg,
    description: game.descript,
    reviews,
  } as {
    title: string;
    release_date: string;
    rating_avg: number;
    description: string;
    reviews: Array<{
      id: number;
      user: string;
      recommended: boolean;
      upvotes: number;
      text: string;
      time: string;
    }>;
  };
};

const sortByDateDesc = <T extends object>(items: T[], dateKey: keyof T) => {
  return [...items].sort((a, b) => {
    const left = new Date(String((a as Record<string, unknown>)[dateKey as string] ?? '')).getTime();
    const right = new Date(String((b as Record<string, unknown>)[dateKey as string] ?? '')).getTime();
    return right - left;
  });
};

export const getLatestGames = (count = 4) => sortByDateDesc(GAMES, 'release_date' as keyof Game).slice(0, count);
export const getLatestReviews = (count = 6) => sortByDateDesc(REVIEWS, 'date_created' as keyof Review).slice(0, count);

export const LATEST_GAMES_MOCK = getLatestGames(4);
export const LATEST_REVIEWS_MOCK = getLatestReviews(3);
export const ALL_GAMES = GAMES;
export const RECENT_REVIEWS_MOCK = getLatestReviews(6);

export const PROFILE_USER: User = USERS[0];
export const FAVORITE_GAMES = getUserLikedGames(USERS[0].user_id ?? 1);
export const RECENT_REVIEWS = getLatestReviews(3);
export const USER_LIKED_GAMES = getUserLikedGames(USERS[0].user_id ?? 1);
export const USER_RECENT_REVIEWS = REVIEWS.slice(0, 3);

export const MOCK_REVIEW_DETAILS = getReviewDetailById(REVIEWS[0].review_id);
export const MOCK_GAME_DETAILS = getGameDetailById(GAMES[0].game_id);
