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
  "Dorfbewohner: Wenn dieser Krieg endet, werde ich endlich meine Liebste heiraten können.",
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

// Export a default function instead of a named export
export default function useGameCommentary({
  isGameActive,
  isPaused,
  playerBuildingCount,
  enemyBuildingCount,
  showMessage,
  gameEvents
}: GameCommentaryProps) {
  const [lastCommentTime, setLastCommentTime] = useState(0);
  const [commentCooldown, setCommentCooldown] = useState(30000); // 30 seconds default

  // Get random comment
  const getRandomComment = useCallback(() => {
    const commentCategories: string[][] = [];
    
    // Always include general comments
    commentCategories.push(GENERAL_COMMENTS);
    
    // Include situational comments
    if (gameEvents.combatOccurring) {
      commentCategories.push(BATTLE_COMMENTS);
    }
    
    if (playerBuildingCount > enemyBuildingCount) {
      commentCategories.push(PLAYER_WINNING_COMMENTS);
    } else if (playerBuildingCount < enemyBuildingCount) {
      commentCategories.push(PLAYER_LOSING_COMMENTS);
    }
    
    // Add character comments
    commentCategories.push(VILLAGER_COMMENTS);
    commentCategories.push(MERCHANT_COMMENTS);
    
    // Add enemy taunts occasionally
    if (Math.random() < 0.15) {
      commentCategories.push(ENEMY_COMMENTS);
    }
    
    // Select a random category (ensure we have at least one category)
    if (commentCategories.length === 0) {
      return GENERAL_COMMENTS[Math.floor(Math.random() * GENERAL_COMMENTS.length)];
    }
    
    const selectedCategory = commentCategories[Math.floor(Math.random() * commentCategories.length)];
    
    // Return a random comment from the selected category
    return selectedCategory[Math.floor(Math.random() * selectedCategory.length)];
  }, [gameEvents, playerBuildingCount, enemyBuildingCount]);

  // Event-triggered comments
  useEffect(() => {
    if (!isGameActive || isPaused) return;
    
    // Handle specific events
    if (gameEvents.playerCapturedBuilding) {
      showMessage("Unsere Truppen haben ein neues Gebiet eingenommen!", "Bote");
    } else if (gameEvents.playerLostBuilding) {
      showMessage("Der Feind hat eines unserer Gebiete erobert!", "Wachposten");
    } else if (gameEvents.enemyCapturedBuilding) {
      showMessage("Der Feind breitet sich weiter aus, mein Herr.", "Späher");
    }
  }, [gameEvents, isGameActive, isPaused, showMessage]);

  // Periodic random comments
  useEffect(() => {
    if (!isGameActive || isPaused) return;
    
    const commentInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastCommentTime >= commentCooldown) {
        const comment = getRandomComment();
        showMessage(comment);
        setLastCommentTime(now);
        
        // Vary the cooldown between comments
        setCommentCooldown(25000 + Math.random() * 35000); // 25-60 seconds
      }
    }, 10000);
    
    return () => clearInterval(commentInterval);
  }, [isGameActive, isPaused, lastCommentTime, commentCooldown, getRandomComment, showMessage]);

  // Handle manual comment forcing (for testing)
  const forceComment = useCallback(() => {
    if (!isGameActive || isPaused) return;
    
    const comment = getRandomComment();
    showMessage(comment);
    setLastCommentTime(Date.now());
  }, [isGameActive, isPaused, getRandomComment, showMessage]);

  return { forceComment };
} 