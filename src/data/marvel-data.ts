/**
 * @fileoverview Marvel character and theme data for the pre-production blueprint application.
 * This module provides curated lists of Marvel heroes, villains, and narrative themes
 * to be used in plot generation and character selection.
 */

/**
 * Curated list of iconic Marvel heroes.
 * Includes both classic and modern characters from the Marvel Universe.
 */
export const marvelHeroes: string[] = [
  'Spider-Man (Peter Parker)',
  'Spider-Man (Miles Morales)',
  'Iron Man',
  'Captain America',
  'Thor',
  'Hulk',
  'Black Widow',
  'Hawkeye',
  'Captain Marvel',
  'Doctor Strange',
  'Black Panther',
  'Wolverine',
  'Cyclops',
  'Jean Grey',
  'Storm',
  'Daredevil',
  'The Punisher',
  'Moon Knight',
  'Ms. Marvel (Kamala Khan)',
  'She-Hulk',
];

/**
 * Curated list of iconic Marvel villains.
 * Includes major antagonists from across the Marvel Universe.
 */
export const marvelVillains: string[] = [
  'Thanos',
  'Doctor Doom',
  'Magneto',
  'Loki',
  'Green Goblin',
  'Venom',
  'Red Skull',
  'Kingpin',
  'Mysterio',
  'Doctor Octopus',
  'The Prowler',
  'Apocalypse',
  'Galactus',
  'Kang the Conqueror',
  'Ultron',
];

/**
 * Common narrative themes found in Marvel stories.
 * These themes can be used to generate compelling episode plots.
 */
export const marvelThemes: string[] = [
  'Family legacy and betrayal',
  'The price of power',
  'Redemption and second chances',
  'Identity crisis and self-discovery',
  'Prejudice and acceptance',
  'Science vs. Magic',
  'Order vs. Chaos',
  'Sacrifice for the greater good',
  'With great power comes great responsibility',
  'Time travel and alternate realities',
  'Corporate greed vs. justice',
  'Artificial intelligence and humanity',
  'Gods among mortals',
  'The burden of leadership',
  'Revenge and forgiveness',
  'Cosmic threats to Earth',
  'Parallel dimensions and multiverse',
  'Nature vs. technology',
  'Ancient prophecies and destiny',
  'Team dynamics and trust',
];

/**
 * Extended list of art styles for comic strip and concept art generation.
 * Includes classic, modern, and experimental visual styles.
 */
export const artStyles: string[] = [
  'Classic Comic',
  'Manga',
  'Noir',
  'Gritty 90s',
  'Sci-Fi Comic',
  'Fantasy Comic',
  'Superhero Comic',
  'Cyberpunk',
  'Steampunk',
  'Watercolor',
  'Sketch/Line Art',
  'Retro 1960s',
  'Modern Minimalist',
  'Anime',
  'Comic Book Realism',
  'Pop Art',
  'Cel-Shaded',
  'Graffiti Style',
  'Psychedelic',
  'Gothic Horror',
  'Golden Age Comics',
  'Silver Age Comics',
  'Bronze Age Comics',
  'Modern Age Comics',
  'Cartoon Network Style',
  'Disney Animation Style',
  'Studio Ghibli Style',
  'Western Comic',
  'European Bande Dessinée',
  'Underground Comix',
];

/**
 * Visual style presets for quick style guide generation.
 * Each preset combines aesthetic choices for cohesive visual direction.
 */
export const visualStylePresets: Array<{
  name: string;
  description: string;
  keywords: string;
}> = [
  {
    name: 'Cosmic Marvel',
    description: 'Jack Kirby-inspired cosmic energy with vibrant colors and dynamic action',
    keywords: 'Jack Kirby cosmic energy, vibrant nebulas, dynamic action poses, bold outlines, psychedelic space backgrounds',
  },
  {
    name: 'Street Level Grit',
    description: 'Dark, gritty urban aesthetic for street-level heroes',
    keywords: 'Urban noir, dark shadows, realistic proportions, muted color palette, rainy city nights',
  },
  {
    name: 'Modern MCU',
    description: 'Cinematic realism inspired by Marvel Cinematic Universe',
    keywords: 'Photo-realistic rendering, cinematic lighting, detailed textures, modern costumes, practical effects look',
  },
  {
    name: 'Animated Series',
    description: 'Bold lines and vibrant colors like classic animated shows',
    keywords: 'Bold outlines, flat colors with cel-shading, dynamic poses, expressive faces, simplified backgrounds',
  },
  {
    name: 'Manga Fusion',
    description: 'Japanese manga style merged with Marvel aesthetics',
    keywords: 'Manga character design, speed lines, dramatic angles, expressive eyes, high contrast lighting',
  },
  {
    name: 'Retro Silver Age',
    description: 'Classic 1960s-70s comic book aesthetic',
    keywords: 'Ben-Day dots, bright primary colors, dynamic action poses, dramatic word balloons, vintage printing style',
  },
  {
    name: 'Cosmic Horror',
    description: 'Lovecraftian cosmic horror meets Marvel',
    keywords: 'Eldritch tentacles, reality-warping visuals, unsettling color schemes, detailed horror elements, otherworldly beings',
  },
  {
    name: 'Futuristic Tech',
    description: 'High-tech sci-fi aesthetic with neon and holograms',
    keywords: 'Neon lights, holographic interfaces, sleek technology, chrome surfaces, futuristic architecture',
  },
];
