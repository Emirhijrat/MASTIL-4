/**
 * Game commentary messages for neutral entities and enemy AI
 */

export type CommentCategory = 
  | 'neutral_observations'
  | 'neutral_reactions_player'
  | 'neutral_reactions_enemy'
  | 'enemy_taunts_player'
  | 'enemy_strategic_thoughts'
  | 'enemy_reactions_player_success'
  | 'enemy_reactions_player_fail';

export interface CommentarySource {
  id: string;
  displayName: string;
  color?: string;
}

export const COMMENTARY_SOURCES = {
  NEUTRAL_VILLAGERS: {
    id: 'neutral_villagers',
    displayName: 'Dorfbewohner',
    color: '#A6A29A' // Grayish
  },
  NEUTRAL_TRAVELER: {
    id: 'neutral_traveler',
    displayName: 'Reisender',
    color: '#8E9A5D' // Greenish
  },
  NEUTRAL_MERCHANT: {
    id: 'neutral_merchant',
    displayName: 'Händler',
    color: '#D4AF37' // Gold
  },
  ENEMY_COMMANDER: {
    id: 'enemy_commander',
    displayName: 'Feindlicher Kommandant',
    color: '#9D202F' // Deep red
  },
  ENEMY_SCOUT: {
    id: 'enemy_scout',
    displayName: 'Feindlicher Späher',
    color: '#79243C' // Burgundy
  }
};

export const NEUTRAL_OBSERVATIONS = [
  "Ein weiterer Tag, ein weiteres Gemetzel in der Ferne.",
  "Hoffentlich ziehen die einfach weiter...",
  "Manchmal frage ich mich, worum es hier eigentlich geht.",
  "Der Wind trägt seltsame Gerüchte herbei.",
  "Schon wieder Truppenbewegungen? Das kann nichts Gutes bedeuten.",
  "Die Vögel singen heute besonders leise.",
  "Ich hab gehört, auf der anderen Seite des Flusses gibt's besseres Bier.",
  "Meine Hühner legen vor lauter Stress keine Eier mehr!",
  "War das gerade ein Kampfschrei oder nur der Nachbar?",
  "Ich sollte wirklich mal meine Steuerschulden begleichen...",
  "Wenn das so weitergeht, wandere ich aus.",
  "Diese ständigen Märsche machen die Wege kaputt!",
  "Ich wünschte, es wäre schon Erntezeit.",
  "Hat jemand meine Ziege gesehen?",
  "Die Stimmung ist heute wieder zum Schneiden."
];

export const NEUTRAL_REACTIONS_PLAYER = [
  "Oh, da drüben wird's brenzlig!",
  "Sieht so aus, als hätte da jemand Ärger gesucht... und gefunden.",
  "Das wird sicher hässlich.",
  "Hoffentlich bleiben die von meinen Feldern fern!",
  "Wer auch immer gewinnt, wir verlieren.",
  "Typisch... immer auf die Kleinen.",
  "Mutig, mutig... oder einfach nur dumm.",
  "Das gibt bestimmt wieder tagelang Rauchschwaden.",
  "Können die das nicht woanders austragen?",
  "Ich setz' fünf Kupfer auf den Blauen!"
];

export const NEUTRAL_REACTIONS_ENEMY = [
  "Der Feind scheint heute besonders motiviert zu sein.",
  "Die Truppen marschieren mit beängstigender Entschlossenheit.",
  "Ihre Rüstungen glänzen wie frisch poliert.",
  "Man hört Gerüchte über einen neuen feindlichen Strategen.",
  "Ihre Flaggen wirken heute irgendwie bedrohlicher.",
  "Solche Manöver habe ich seit Jahren nicht gesehen.",
  "Sie scheinen besser organisiert als sonst.",
  "Es heißt, sie haben neue Verbündete gewonnen.",
  "Ihre Katapulte sehen furchteinflößend aus.",
  "Jemand sollte dem Kommandanten sagen, dass das hier ein Dorf ist, kein Schlachtfeld."
];

export const ENEMY_TAUNTS_PLAYER = [
  "Ein armseliger Versuch, mich aufzuhalten!",
  "Ist das alles, was du zu bieten hast?",
  "Deine Truppen sind schwach und schlecht geführt.",
  "Dieser kleine Nadelstich wird dich nicht retten.",
  "Du kämpfst wie ein Bauer!",
  "Ich lache über deine jämmerlichen Angriffe.",
  "Gib auf, solange du noch kannst!",
  "Jeder deiner Fehler stärkt mich nur.",
  "Du glaubst wirklich, du könntest gewinnen?",
  "Deine Basis wird bald in Schutt und Asche liegen."
];

export const ENEMY_STRATEGIC_THOUGHTS = [
  "Meine Strategie ist unfehlbar!",
  "Bald gehört dieses Land mir!",
  "Meine Truppen sind unaufhaltsam.",
  "Jeder Turm wird fallen!",
  "Ich sehe jeden eurer Züge voraus.",
  "Die Vorräte sind gesichert, der Angriff kann beginnen.",
  "Meine Späher berichten von Schwäche.",
  "Dieser Sektor wird bald unter meiner Kontrolle sein.",
  "Die Zeit für Diplomatie ist vorbei!",
  "Nur ein Narr widersetzt sich mir.",
  "Meine Macht wächst mit jeder Stunde.",
  "Ich werde dieses Schlachtfeld dominieren.",
  "Die Elemente selbst gehorchen mir!",
  "Ein brillanter Plan reift in meinem Geist.",
  "Niemand kann meine Legionen aufhalten!"
];

export const ENEMY_REACTIONS_PLAYER_SUCCESS = [
  "Ein glücklicher Zufall. Mehr nicht.",
  "Genießt diesen kleinen Sieg, solange ihr könnt.",
  "Dieser Verlust ist unbedeutend.",
  "Meine Truppen werden euren Vormarsch bald stoppen.",
  "Ein kluger Schachzug, aber nicht klug genug.",
  "Ihr spielt mit dem Feuer und werdet euch verbrennen.",
  "Unterschätzt nicht die Macht meiner Verstärkungen.",
  "Dieser Turm war ohnehin überflüssig.",
  "Ihr habt keine Ahnung, was euch noch erwartet.",
  "Lediglich ein taktischer Rückzug."
];

export const ENEMY_REACTIONS_PLAYER_FAIL = [
  "War das euer bester Angriff? Erbärmlich!",
  "Eure Niederlage war vorhersehbar.",
  "Wie ich es erwartet habe - absolute Inkompetenz.",
  "Ist das die Strategie eines Kindes?",
  "Meine Truppen haben kaum geschwitzt.",
  "So leicht besiegt? Ich bin fast enttäuscht.",
  "Jetzt steht nichts mehr zwischen mir und der Eroberung.",
  "Eure Taktik hat mehr Löcher als ein Käse.",
  "Meine Defensive ist undurchdringlich.",
  "Niemand wird sich an euren kläglichen Widerstand erinnern."
];

/**
 * Maps category names to actual message arrays
 */
export const COMMENT_CATEGORIES = {
  neutral_observations: NEUTRAL_OBSERVATIONS,
  neutral_reactions_player: NEUTRAL_REACTIONS_PLAYER,
  neutral_reactions_enemy: NEUTRAL_REACTIONS_ENEMY,
  enemy_taunts_player: ENEMY_TAUNTS_PLAYER,
  enemy_strategic_thoughts: ENEMY_STRATEGIC_THOUGHTS,
  enemy_reactions_player_success: ENEMY_REACTIONS_PLAYER_SUCCESS,
  enemy_reactions_player_fail: ENEMY_REACTIONS_PLAYER_FAIL
}; 