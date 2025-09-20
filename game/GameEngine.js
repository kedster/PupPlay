import { Player } from './Player.js';
import { StoryMode } from './StoryMode.js';
import { PetShop } from './PetShop.js';

export class GameEngine {
  constructor() {
    this.player = null;
    this.storyMode = new StoryMode();
    this.petShop = new PetShop();
    this.gameState = 'menu'; // menu, playing, story, shop
    this.aiEventTimer = 0;
    this.gameVersion = '1.0.0';
  }

  // Game initialization
  newGame(playerName) {
    this.player = new Player(playerName);
    this.gameState = 'playing';
    return `Welcome to PupPlay, ${playerName}! Your adventure begins now.`;
  }

  loadGame(playerName) {
    const loadedPlayer = Player.load(playerName);
    if (!loadedPlayer) {
      return { success: false, message: `No save file found for ${playerName}` };
    }
    this.player = loadedPlayer;
    this.storyMode.currentChapter = loadedPlayer.storyProgress.currentChapter;
    this.gameState = 'playing';
    return { success: true, message: `Welcome back, ${playerName}!` };
  }

  saveGame() {
    if (!this.player) {
      return { success: false, message: 'No active game to save!' };
    }
    const savePath = this.player.save();
    return { success: true, message: `Game saved to ${savePath}` };
  }

  // Main game loop mechanics
  processTime() {
    if (!this.player) return [];

    const results = [];
    
    // Pet AI - pets change over time
    this.player.pets.forEach(pet => {
      pet.passTime();
      
      // Random pet interactions (AI behavior)
      if (Math.random() < 0.1) {
        results.push(`🐾 ${pet.getRandomInteraction()}`);
      }
      
      // Pet level ups
      const levelUp = pet.checkLevelUp();
      if (levelUp) {
        results.push(levelUp);
      }
    });

    // Check for story quest progress
    const storyResults = this.storyMode.checkQuestProgress(this.player);
    results.push(...storyResults);

    // Random story events (AI-driven)
    this.aiEventTimer++;
    if (this.aiEventTimer >= 10 && Math.random() < 0.2) {
      const event = this.storyMode.getRandomStoryEvent(this.player);
      results.push(`📖 Story Event: ${event.title} - ${event.description}`);
      results.push(`Choices: ${event.choices.map((c, i) => `${i + 1}. ${c.text}`).join(', ')}`);
      this.aiEventTimer = 0;
    }

    // Daily care results
    const careResults = this.player.dailyCare();
    results.push(...careResults);

    return results;
  }

  // Pet care actions
  feedPet(petIndex) {
    if (!this.validatePetIndex(petIndex)) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = this.player.pets[petIndex];
    const result = pet.feed();
    this.player.addExperience(5);
    return { success: true, message: result };
  }

  playWithPet(petIndex) {
    if (!this.validatePetIndex(petIndex)) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = this.player.pets[petIndex];
    const result = pet.play();
    this.player.addExperience(10);
    return { success: true, message: result };
  }

  cleanPet(petIndex) {
    if (!this.validatePetIndex(petIndex)) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = this.player.pets[petIndex];
    const result = pet.clean();
    this.player.addExperience(3);
    return { success: true, message: result };
  }

  petRest(petIndex) {
    if (!this.validatePetIndex(petIndex)) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = this.player.pets[petIndex];
    const result = pet.rest();
    this.player.addExperience(2);
    return { success: true, message: result };
  }

  // Pet interaction (AI response)
  interactWithPet(petIndex) {
    if (!this.validatePetIndex(petIndex)) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = this.player.pets[petIndex];
    const interaction = pet.getRandomInteraction();
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.experience += 2;
    this.player.addExperience(1);
    
    return { success: true, message: interaction };
  }

  validatePetIndex(index) {
    return this.player && index >= 0 && index < this.player.pets.length;
  }

  // Shop operations
  visitShop() {
    this.gameState = 'shop';
    return {
      pets: this.petShop.getAvailablePets(),
      supplies: this.petShop.getSupplies(),
      playerMoney: this.player.money
    };
  }

  purchasePet(petIndex, petName) {
    return this.petShop.purchasePet(this.player, petIndex, petName);
  }

  purchaseSupply(supplyIndex, quantity = 1) {
    return this.petShop.purchaseSupply(this.player, supplyIndex, quantity);
  }

  useSupply(supplyName, petIndex) {
    return this.petShop.useSupply(this.player, supplyName, petIndex);
  }

  // House management
  upgradeHouse() {
    return this.player.upgradeHouse();
  }

  cleanHouse() {
    const cost = 10;
    const result = this.player.spendMoney(cost, 'house cleaning');
    if (!result.success) {
      return result;
    }

    this.player.house.cleanliness = 100;
    this.player.pets.forEach(pet => {
      pet.happiness = Math.min(100, pet.happiness + 5);
    });
    this.player.addExperience(10);

    return { success: true, message: 'House cleaned! All pets are happier in the clean environment.' };
  }

  // Story mode
  enterStoryMode() {
    this.gameState = 'story';
    const currentChapter = this.storyMode.getCurrentChapter();
    const availableQuests = this.storyMode.getAvailableQuests();
    
    return {
      chapter: currentChapter,
      quests: availableQuests,
      playerProgress: this.player.storyProgress
    };
  }

  processStoryChoice(eventIndex, choiceIndex) {
    const event = this.storyMode.getRandomStoryEvent(this.player);
    if (choiceIndex < 0 || choiceIndex >= event.choices.length) {
      return { success: false, message: 'Invalid choice!' };
    }

    const choice = event.choices[choiceIndex];
    const result = this.storyMode.processStoryChoice(choice, this.player);
    
    return { success: true, message: result };
  }

  // Game status and information
  getGameStatus() {
    if (!this.player) {
      return { gameState: this.gameState, message: 'No active game' };
    }

    return {
      gameState: this.gameState,
      player: this.player.getStatus(),
      currentChapter: this.storyMode.currentChapter,
      availableQuests: this.storyMode.getAvailableQuests().length,
      shopPets: this.petShop.getAvailablePets().length
    };
  }

  getPetDetails(petIndex) {
    if (!this.validatePetIndex(petIndex)) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = this.player.pets[petIndex];
    return {
      success: true,
      pet: pet.getStatus(),
      interactions: [
        { action: 'feed', description: 'Feed your pet to reduce hunger' },
        { action: 'play', description: 'Play with your pet to increase happiness' },
        { action: 'clean', description: 'Clean your pet to improve cleanliness' },
        { action: 'rest', description: 'Let your pet rest to restore energy' },
        { action: 'interact', description: 'Interact with your pet for bonding' }
      ]
    };
  }

  // Game levels and progression
  getPlayerLevel() {
    return this.player ? this.player.level : 0;
  }

  getAvailableFeatures() {
    if (!this.player) return [];

    const features = ['basic_care', 'pet_shop'];
    
    if (this.player.storyProgress.unlockedContent.includes('advanced_pets')) {
      features.push('advanced_pets');
    }
    if (this.player.storyProgress.unlockedContent.includes('decorations')) {
      features.push('house_decorations');
    }
    if (this.player.storyProgress.unlockedContent.includes('breeding')) {
      features.push('pet_breeding');
    }
    if (this.player.level >= 5) {
      features.push('competitions');
    }
    if (this.player.level >= 10) {
      features.push('trading');
    }

    return features;
  }

  // AI neighbor system (future expansion ready)
  getNeighborHelp() {
    const helpOptions = [
      { neighbor: 'Sarah', task: 'Walk her dog', reward: 50, difficulty: 1 },
      { neighbor: 'Mike', task: 'Feed his cats while away', reward: 75, difficulty: 2 },
      { neighbor: 'Elena', task: 'Clean bird cage', reward: 40, difficulty: 1 }
    ];

    return helpOptions;
  }

  helpNeighbor(helpIndex) {
    const helpOptions = this.getNeighborHelp();
    if (helpIndex < 0 || helpIndex >= helpOptions.length) {
      return { success: false, message: 'Invalid help option!' };
    }

    const task = helpOptions[helpIndex];
    this.player.earnMoney(task.reward, `helping ${task.neighbor}`);
    this.player.addExperience(task.difficulty * 25);
    
    if (!this.player.achievements.includes('helper')) {
      this.player.achievements.push('helper');
    }

    return {
      success: true,
      message: `Helped ${task.neighbor} with ${task.task}! Earned $${task.reward} and gained experience.`
    };
  }
}