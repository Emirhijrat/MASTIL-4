import { useState, useEffect, useCallback } from 'react';

// Commentary categories
const GENERAL_COMMENTS = [
  "Das Wetter ist perfekt für eine Schlacht!",
  "Der Wind trägt Gerüchte von weit her...",
  "Die Ernte wird dieses Jahr gut ausfallen, wenn die Kämpfe uns verschonen.",
  "Man munkelt von vergrabenen Schätzen in diesen Ländereien.",
  "Die alten Sagen sprechen von einem Drachen, der diese Berge bewacht.",
  "Der Mond steht günstig für mutige Entscheidungen.",
  "Die Geister der Gefallenen sollen über diese Felder wandeln."
];

const BATTLE_COMMENTS = [
  "Das Klirren der Schwerter hallt über das Schlachtfeld!",
  "Die Bogenschützen zielen mit tödlicher Präzision!",
  "Die Kavallerie stürmt über die Ebene!",
  "Schilde splittern unter den wuchtigen Hieben!",
  "Die Kriegstrommeln dröhnen im Rhythmus der Angriffe!",
  "Die Banner wehen stolz im Wind des Gefechts!",
  "Die Schlachtreihen formieren sich neu!"
];

const PLAYER_WINNING_COMMENTS = [
  "Eure Truppen kämpfen mit dem Mut von Löwen!",
  "Euer Ruhm verbreitet sich im ganzen Land!",
  "Die Feinde zittern vor Eurer Macht!",
  "Balladen werden über Eure Siege gesungen werden!",
  "Eure Strategie ist meisterhaft!",
  "Die Geschichte wird Euch als weisen Herrscher in Erinnerung behalten!",
  "Eure Gegner bereuen den Tag, an dem sie Euch herausforderten!"
];

const PLAYER_LOSING_COMMENTS = [
  "Unsere Truppen benötigen dringend Verstärkung!",
  "Die Vorräte schwinden, mein Fürst!",
  "Die Moral der Truppen sinkt bedenklich!",
  "Wir müssen unsere Strategie überdenken!",
  "Der Feind rückt unaufhaltsam vor!",
  "Die Lage ist ernst, aber nicht hoffnungslos!",
  "Unsere Späher berichten von weiteren feindlichen Verstärkungen!"
];

const VILLAGER_COMMENTS = [
  "Dorfbewohner: Mögen die Götter uns in diesen dunklen Zeiten beistehen.",
  "Dorfbewohner: Meine Hütte wurde im letzten Angriff niedergebrannt!",
  "Dorfbewohner: Wir beten für Euren Erfolg, Herr!",
  "Dorfbewohner: Die Kinder verstecken sich in den Wäldern, wenn die Soldaten kommen.",
  "Dorfbewohner: Unsere Ernte wurde von marodierenden Truppen gestohlen!",
  "Dorfbewohner: Wenn dieser Krieg endet, werde ich endlich meine LiebSte heiraten können.",
  "Dorfbewohner: Die alten Leute sagen, dass früher alles besser war..."
];

const MERCHANT_COMMENTS = [
  "Händler: Die Preise für Waffen steigen mit jedem Tag des Krieges!",
  "Händler: Ich habe feine Waren aus fernen Ländern, trotz der gefährlichen Wege!",
  "Händler: Gold regiert die Welt, auch in Kriegszeiten, mein Fürst!",
  "Händler: Meine Karawane wurde dreimal überfallen auf dem Weg hierher!",
  "Händler: Für den richtigen Preis kann ich Euch Informationen über feindliche Bewegungen verschaffen.",
  "Händler: Der Handel blüht selbst in dunkelsten Zeiten, nicht wahr?",
  "Händler: Ich zahle gute Preise für Beute aus eroberten Gebieten!"
];

const ENEMY_COMMENTS = [
  "Feindlicher Kommandant: Eure Tage sind gezählt!",
  "Feindlicher Kommandant: Wir werden Euer Land dem Erdboden gleichmachen!",
  "Feindlicher Kommandant: Meine Truppen sind Euren weit überlegen!",
  "Feindlicher Kommandant: Ergebt Euch, und ich gewähre Euch einen schnellen Tod!",
  "Feindlicher Kommandant: Eure Verteidigung ist so schwach wie Euer Geist!",
  "Feindlicher Kommandant: Bald werde ich auf den Ruinen Eurer Burg speisen!",
  "Feindlicher Kommandant: Mein Schwert dürstet nach dem Blut Eurer Krieger!"
];

const NEUTRAL_OBSERVER_COMMENTS = [
  "Reisender: Die Landschaft verändert sich mit jedem neuen Herrscher.",
  "Reisender: Ich habe gesehen, wie Mächte aufsteigen und fallen.",
  "Reisender: Krieg bringt nur Leid für die einfachen Leute.",
  "Reisender: Die großen Herrscher spielen ihre Spiele, und wir leiden darunter.",
  "Reisender: Es wäre gut, wenn diese Kämpfe bald enden würden.",
  "Reisender: Der Rauch der brennenden Dörfer verdunkelt den Himmel.",
  "Reisender: Wer auch immer gewinnt, die Bauern verlieren immer."
];

// Speaker types for alternation
type SpeakerType = 'enemy' | 'neutral' | 'system' | 'event';

// Message priority levels
type MessagePriority = 'high' | 'medium' | 'low';

// Configuration constants
// Improved cooldown system with randomization
const POSSIBLE_COOLDOWNS = [8000, 10000, 12000, 15000]; // Randomized cooldown times in ms
const EVENT_MESSAGE_COOLDOWN = 4000;   // 4 seconds minimum for event-based messages
const INITIAL_ENEMY_TAUNT_DELAY = 5000; // 5 seconds after game start before enemy taunts
const MAX_CONSECUTIVE_SAME_SPEAKER = 2; // Maximum number of times the same speaker type can speak consecutively

type GameCommentaryProps = {
  isGameActive: boolean;
  isPaused: boolean;
  playerBuildingCount: number;
  enemyBuildingCount: number;
  showMessage: (text: string, speaker?: string, speakerColor?: string) => void;
  gameEvents: {
    playerCapturedBuilding: boolean;
    playerLostBuilding: boolean;
    enemyCapturedBuilding: boolean;
    enemyLostBuilding: boolean;
    combatOccurring: boolean;
  };
};

// Named export function (for imports using curly braces)
export function useGameCommentary(props: GameCommentaryProps) {
  const {
    isGameActive,
    isPaused,
    playerBuildingCount,
    enemyBuildingCount,
    showMessage,
    gameEvents
  } = props;
  
  // Global message tracking
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [nextSpeakerType, setNextSpeakerType] = useState<SpeakerType>('enemy'); // Start with enemy
  const [hasPlayedInitialTaunt, setHasPlayedInitialTaunt] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [consecutiveSameSpeaker, setConsecutiveSameSpeaker] = useState(0);
  
  // Randomized cooldown duration
  const [currentCooldown, setCurrentCooldown] = useState(POSSIBLE_COOLDOWNS[0]);
  
  // Get a random cooldown duration
  const getRandomCooldown = useCallback(() => {
    return POSSIBLE_COOLDOWNS[Math.floor(Math.random() * POSSIBLE_COOLDOWNS.length)];
  }, []);
  
  // Initialize game start time
  useEffect(() => {
    if (isGameActive && gameStartTime === 0) {
      setGameStartTime(Date.now());
    }
  }, [isGameActive, gameStartTime]);

  // Function to display a message with cooldown and speaker alternation logic
  const displayMessage = useCallback((
    text: string, 
    speakerType: SpeakerType = 'system',
    priority: MessagePriority = 'low',
    speaker?: string,
    speakerColor?: string
  ) => {
    const now = Date.now();
    
    // Skip if game is paused or over
    if (!isGameActive || isPaused) {
      return false;
    }
    
    // Different cooldown rules based on priority
    let requiredCooldown = currentCooldown;
    if (priority === 'high') {
      requiredCooldown = EVENT_MESSAGE_COOLDOWN;
    } else if (priority === 'medium') {
      requiredCooldown = currentCooldown / 2;
    }
    
    // Check if we've waited long enough since the last message
    const hasWaitedLongEnough = now - lastMessageTime >= requiredCooldown;
    
    // Determine if this is the correct speaker's turn with improved alternation
    const isCorrectSpeakerTurn = 
      priority === 'high' || // High priority messages bypass turn order
      speakerType === 'event' || // Event messages bypass turn order
      speakerType === nextSpeakerType || // Is it this speaker's scheduled turn?
      (consecutiveSameSpeaker >= MAX_CONSECUTIVE_SAME_SPEAKER && speakerType !== nextSpeakerType); // Force alternation
    
    // Only show the message if conditions are met
    if (hasWaitedLongEnough && isCorrectSpeakerTurn) {
      // Show the message
      showMessage(text, speaker, speakerColor);
      
      // Update state
      setLastMessageTime(now);
      
      // Set a new random cooldown duration for variety
      setCurrentCooldown(getRandomCooldown());
      
      // Handle speaker alternation logic
      if (speakerType !== 'event' && speakerType !== 'system') {
        if (speakerType === nextSpeakerType) {
          // Same speaker again - increase consecutive counter
          setConsecutiveSameSpeaker(prev => prev + 1);
        } else {
          // Different speaker - reset counter
          setConsecutiveSameSpeaker(0);
        }
        
        // Set the next speaker type - improved alternation logic
        if (consecutiveSameSpeaker >= MAX_CONSECUTIVE_SAME_SPEAKER - 1) {
          // Force alternation when the same speaker has spoken too many times
          setNextSpeakerType(speakerType === 'enemy' ? 'neutral' : 'enemy');
        } else {
          // Randomize next speaker with bias towards alternation
          const shouldAlternate = Math.random() < 0.7; // 70% chance to alternate speakers
          setNextSpeakerType(shouldAlternate ? (speakerType === 'enemy' ? 'neutral' : 'enemy') : speakerType);
        }
      }
      
      return true; // Message was displayed
    }
    
    return false; // Message was not displayed
  }, [
    isGameActive, 
    isPaused, 
    lastMessageTime, 
    currentCooldown, 
    nextSpeakerType, 
    consecutiveSameSpeaker, 
    showMessage, 
    getRandomCooldown
  ]);

  // Get random enemy comment
  const getRandomEnemyComment = useCallback(() => {
    return ENEMY_COMMENTS[Math.floor(Math.random() * ENEMY_COMMENTS.length)];
  }, []);
  
  // Get random neutral observer comment
  const getRandomNeutralComment = useCallback(() => {
    const commentCategories: string[][] = [];
    
    // Always include general comments from neutral observers
    commentCategories.push(NEUTRAL_OBSERVER_COMMENTS);
    
    // Include villager comments
    commentCategories.push(VILLAGER_COMMENTS);
    
    // Include merchant comments (less frequently)
    if (Math.random() < 0.6) {
      commentCategories.push(MERCHANT_COMMENTS);
    }
    
    // Include situational comments
    if (gameEvents.combatOccurring) {
      commentCategories.push(BATTLE_COMMENTS);
    }
    
    // Select a random category
    const selectedCategory = commentCategories[Math.floor(Math.random() * commentCategories.length)];
    
    // Return a random comment from the selected category
    return selectedCategory[Math.floor(Math.random() * selectedCategory.length)];
  }, [gameEvents]);

  // Initial enemy taunt after game start
  useEffect(() => {
    if (isGameActive && !isPaused && !hasPlayedInitialTaunt && gameStartTime > 0) {
      const now = Date.now();
      
      // Only play the initial taunt after a short delay
      if (now - gameStartTime >= INITIAL_ENEMY_TAUNT_DELAY) {
        const taunt = getRandomEnemyComment();
        displayMessage(taunt, 'enemy', 'high', 'Feindlicher Kommandant', '#ef4444');
        setHasPlayedInitialTaunt(true);
      }
    }
  }, [isGameActive, isPaused, hasPlayedInitialTaunt, gameStartTime, displayMessage, getRandomEnemyComment]);

  // Event-triggered comments (high priority)
  useEffect(() => {
    if (!isGameActive || isPaused) return;
    
    // Handle specific events with high priority
    if (gameEvents.playerCapturedBuilding) {
      displayMessage("Unsere Truppen haben ein neues Gebiet eingenommen!", 'event', 'high', "Bote", "#3b82f6");
    } else if (gameEvents.playerLostBuilding) {
      displayMessage("Der Feind hat eines unserer Gebiete erobert!", 'event', 'high', "Wachposten", "#f97316");
    } else if (gameEvents.enemyCapturedBuilding) {
      displayMessage("Der Feind breitet sich weiter aus, mein Herr.", 'event', 'high', "Späher", "#a3a3a3");
    }
  }, [gameEvents, isGameActive, isPaused, displayMessage]);

  // Combined effect for enemy and neutral comments to ensure better alternation
  useEffect(() => {
    if (!isGameActive || isPaused) return;
    
    const commentInterval = setInterval(() => {
      // Determine whether to attempt a comment based on the current state
      const shouldAttemptComment = Math.random() < 0.3; // 30% chance to attempt a comment in each interval
      
      if (shouldAttemptComment) {
        // If it's the enemy's turn or we need to force alternation
        if (nextSpeakerType === 'enemy' || consecutiveSameSpeaker >= MAX_CONSECUTIVE_SAME_SPEAKER) {
          const comment = getRandomEnemyComment();
          displayMessage(comment, 'enemy', 'low', 'Feindlicher Kommandant', '#ef4444');
        } 
        // If it's the neutral's turn
        else if (nextSpeakerType === 'neutral') {
          const comment = getRandomNeutralComment();
          displayMessage(comment, 'neutral', 'low');
        }
      }
    }, 8000); // Check regularly, but actual display will be controlled by cooldown logic
    
    return () => clearInterval(commentInterval);
  }, [
    isGameActive, 
    isPaused, 
    nextSpeakerType, 
    consecutiveSameSpeaker, 
    displayMessage, 
    getRandomEnemyComment, 
    getRandomNeutralComment
  ]);

  // Public API for the hook - allows forcing comments from outside
  const forceComment = useCallback((speakerType: SpeakerType = 'system') => {
    if (!isGameActive || isPaused) return;
    
    let comment = '';
    let speakerName: string | undefined;
    let speakerColor: string | undefined;
    
    if (speakerType === 'enemy') {
      comment = getRandomEnemyComment();
      speakerName = 'Feindlicher Kommandant';
      speakerColor = '#ef4444';
    } else if (speakerType === 'neutral') {
      comment = getRandomNeutralComment();
      // Neutral speakers have their name in the comment string
    } else {
      // For system, select randomly between enemy and neutral
      if (Math.random() < 0.5) {
        comment = getRandomEnemyComment();
        speakerType = 'enemy';
        speakerName = 'Feindlicher Kommandant';
        speakerColor = '#ef4444';
      } else {
        comment = getRandomNeutralComment();
        speakerType = 'neutral';
      }
    }
    
    displayMessage(comment, speakerType, 'medium', speakerName, speakerColor);
  }, [isGameActive, isPaused, displayMessage, getRandomEnemyComment, getRandomNeutralComment]);

  // Public method to check if a message can be displayed
  const canDisplayMessage = useCallback((priority: MessagePriority = 'low') => {
    if (!isGameActive || isPaused) return false;
    
    const now = Date.now();
    let requiredCooldown = currentCooldown;
    
    if (priority === 'high') {
      requiredCooldown = EVENT_MESSAGE_COOLDOWN;
    } else if (priority === 'medium') {
      requiredCooldown = currentCooldown / 2;
    }
    
    return now - lastMessageTime >= requiredCooldown;
  }, [isGameActive, isPaused, lastMessageTime, currentCooldown]);

  return { 
    forceComment,
    canDisplayMessage,
    displayMessage
  };
}

// Also export as default for default imports
export default useGameCommentary; 