import readline from 'readline';
import { GameEngine } from './game/GameEngine.js';

class PupPlayCLI {
  constructor() {
    this.game = new GameEngine();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.gameLoop = null;
  }

  async start() {
    console.log(`
🐾 ═══════════════════════════════════════ 🐾
        Welcome to PupPlay v${this.game.gameVersion}
   The Ultimate Virtual Pet Simulation Game!
🐾 ═══════════════════════════════════════ 🐾

Features:
• Adopt and care for multiple pet species
• Story mode with AI-driven adventures  
• Purchase supplies and upgrade your house
• Multiple levels and progression system
• AI pet behaviors and interactions
• Save/Load your progress
• Help neighbors and complete quests
`);

    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log('\n📋 Main Menu:');
    console.log('1. 🆕 New Game');
    console.log('2. 📂 Load Game');
    console.log('3. ❌ Exit');

    const choice = await this.getInput('\n👉 Choose an option (1-3): ');
    
    switch (choice.trim()) {
      case '1':
        await this.startNewGame();
        break;
      case '2':
        await this.loadGame();
        break;
      case '3':
        console.log('\n👋 Thanks for playing PupPlay! Goodbye!');
        this.rl.close();
        return;
      default:
        console.log('❌ Invalid choice! Please try again.');
        await this.showMainMenu();
    }
  }

  async startNewGame() {
    console.log('\n🆕 Starting a new game...');
    const playerName = await this.getInput('👤 Enter your name: ');
    
    if (!playerName.trim()) {
      console.log('❌ Name cannot be empty!');
      return await this.startNewGame();
    }

    const message = this.game.newGame(playerName.trim());
    console.log(`\n✅ ${message}`);
    console.log(`💰 Starting money: $${this.game.player.money}`);
    console.log(`🏠 House level: ${this.game.player.house.level} (capacity: ${this.game.player.house.capacity} pets)`);
    
    await this.startGameLoop();
  }

  async loadGame() {
    console.log('\n📂 Loading game...');
    const playerName = await this.getInput('👤 Enter player name to load: ');
    
    const result = this.game.loadGame(playerName.trim());
    if (!result.success) {
      console.log(`❌ ${result.message}`);
      return await this.showMainMenu();
    }

    console.log(`\n✅ ${result.message}`);
    await this.startGameLoop();
  }

  async startGameLoop() {
    // Start background AI processing
    this.gameLoop = setInterval(() => {
      const events = this.game.processTime();
      if (events.length > 0) {
        console.log('\n🤖 AI Events:');
        events.forEach(event => console.log(`   ${event}`));
      }
    }, 10000); // Every 10 seconds

    await this.showGameMenu();
  }

  async showGameMenu() {
    const status = this.game.getGameStatus();
    console.log('\n' + '═'.repeat(50));
    console.log(`👤 ${status.player.name} | Level ${status.player.level} | 💰 $${status.player.money}`);
    console.log(`🐾 Pets: ${status.player.pets.length}/${status.player.house.capacity} | 🏠 House Level ${status.player.house.level}`);
    console.log('═'.repeat(50));

    console.log('\n🎮 Game Menu:');
    console.log('1. 🐾 Manage Pets');
    console.log('2. 🏪 Visit Pet Shop');
    console.log('3. 🏠 Manage House');
    console.log('4. 📖 Story Mode');
    console.log('5. 🤝 Help Neighbors');
    console.log('6. 📊 View Status');
    console.log('7. 💾 Save Game');
    console.log('8. 🔙 Main Menu');

    const choice = await this.getInput('\n👉 Choose an option (1-8): ');
    
    switch (choice.trim()) {
      case '1':
        await this.managePets();
        break;
      case '2':
        await this.visitShop();
        break;
      case '3':
        await this.manageHouse();
        break;
      case '4':
        await this.storyMode();
        break;
      case '5':
        await this.helpNeighbors();
        break;
      case '6':
        await this.viewStatus();
        break;
      case '7':
        await this.saveGame();
        break;
      case '8':
        clearInterval(this.gameLoop);
        await this.showMainMenu();
        return;
      default:
        console.log('❌ Invalid choice! Please try again.');
    }

    await this.showGameMenu();
  }

  async managePets() {
    const pets = this.game.player.pets;
    
    if (pets.length === 0) {
      console.log('\n🐾 You have no pets yet! Visit the pet shop to adopt some.');
      return;
    }

    console.log('\n🐾 Your Pets:');
    pets.forEach((pet, index) => {
      const status = pet.getStatus();
      const needs = status.needsAttention;
      const needsStr = needs.length > 0 ? ` (needs: ${needs.join(', ')})` : ' ✨';
      console.log(`${index + 1}. ${status.name} the ${status.species} - Level ${status.level}${needsStr}`);
      console.log(`   😊 ${status.happiness}% | 🍽️ ${100-status.hunger}% | ⚡ ${status.energy}% | 🧽 ${status.cleanliness}%`);
    });

    const petChoice = await this.getInput('\n👉 Select a pet (1-' + pets.length + ') or 0 to go back: ');
    const petIndex = parseInt(petChoice) - 1;
    
    if (petChoice.trim() === '0') return;
    
    if (petIndex < 0 || petIndex >= pets.length) {
      console.log('❌ Invalid pet selection!');
      return;
    }

    await this.petActions(petIndex);
  }

  async petActions(petIndex) {
    const pet = this.game.player.pets[petIndex];
    const status = pet.getStatus();
    
    console.log(`\n🐾 ${status.name} the ${status.species}:`);
    console.log(`   Level ${status.level} | XP: ${status.experience}/${status.level * 100}`);
    console.log(`   😊 Happiness: ${status.happiness}%`);
    console.log(`   🍽️ Hunger: ${100-status.hunger}% (${status.hunger > 70 ? 'HUNGRY!' : 'ok'})`);
    console.log(`   ⚡ Energy: ${status.energy}% (${status.energy < 20 ? 'TIRED!' : 'ok'})`);
    console.log(`   🧽 Cleanliness: ${status.cleanliness}% (${status.cleanliness < 30 ? 'DIRTY!' : 'ok'})`);

    console.log('\n🎯 Actions:');
    console.log('1. 🍽️ Feed');
    console.log('2. 🎾 Play');
    console.log('3. 🧽 Clean');
    console.log('4. 😴 Rest');
    console.log('5. 💕 Interact');
    console.log('6. 🔙 Back');

    const choice = await this.getInput('\n👉 Choose an action (1-6): ');
    
    let result;
    switch (choice.trim()) {
      case '1':
        result = this.game.feedPet(petIndex);
        break;
      case '2':
        result = this.game.playWithPet(petIndex);
        break;
      case '3':
        result = this.game.cleanPet(petIndex);
        break;
      case '4':
        result = this.game.petRest(petIndex);
        break;
      case '5':
        result = this.game.interactWithPet(petIndex);
        break;
      case '6':
        return;
      default:
        console.log('❌ Invalid choice!');
        return;
    }

    if (result) {
      console.log(`\n✅ ${result.message}`);
    }
  }

  async visitShop() {
    const shopData = this.game.visitShop();
    
    console.log('\n🏪 Welcome to the Pet Shop!');
    console.log(`💰 Your money: $${shopData.playerMoney}`);
    
    console.log('\n1. 🐾 Adopt Pets');
    console.log('2. 🛒 Buy Supplies');
    console.log('3. 🔙 Back');

    const choice = await this.getInput('\n👉 Choose an option (1-3): ');
    
    switch (choice.trim()) {
      case '1':
        await this.adoptPets(shopData.pets);
        break;
      case '2':
        await this.buySupplies(shopData.supplies);
        break;
      case '3':
        return;
      default:
        console.log('❌ Invalid choice!');
    }
  }

  async adoptPets(availablePets) {
    console.log('\n🐾 Available Pets:');
    availablePets.forEach((pet, index) => {
      const traits = pet.traits.join(', ');
      console.log(`${index + 1}. ${pet.breed} ${pet.species} - $${pet.price} (${traits}) [${pet.personality}]`);
    });

    const petChoice = await this.getInput('\n👉 Select a pet (1-' + availablePets.length + ') or 0 to cancel: ');
    const petIndex = parseInt(petChoice) - 1;
    
    if (petChoice.trim() === '0') return;
    
    if (petIndex < 0 || petIndex >= availablePets.length) {
      console.log('❌ Invalid pet selection!');
      return;
    }

    const petName = await this.getInput('🏷️ Enter a name for your new pet: ');
    if (!petName.trim()) {
      console.log('❌ Name cannot be empty!');
      return;
    }

    const result = this.game.purchasePet(petIndex, petName.trim());
    console.log(`\n${result.success ? '✅' : '❌'} ${result.message}`);
  }

  async buySupplies(supplies) {
    console.log('\n🛒 Available Supplies:');
    supplies.forEach((supply, index) => {
      console.log(`${index + 1}. ${supply.name} - $${supply.price} (${supply.description})`);
    });

    const supplyChoice = await this.getInput('\n👉 Select a supply (1-' + supplies.length + ') or 0 to cancel: ');
    const supplyIndex = parseInt(supplyChoice) - 1;
    
    if (supplyChoice.trim() === '0') return;
    
    if (supplyIndex < 0 || supplyIndex >= supplies.length) {
      console.log('❌ Invalid supply selection!');
      return;
    }

    const quantity = await this.getInput('📦 Enter quantity (default 1): ');
    const qty = parseInt(quantity) || 1;

    const result = this.game.purchaseSupply(supplyIndex, qty);
    console.log(`\n${result.success ? '✅' : '❌'} ${result.message}`);
  }

  async manageHouse() {
    const house = this.game.player.house;
    console.log('\n🏠 House Management:');
    console.log(`Level: ${house.level} | Capacity: ${house.capacity} pets`);
    console.log(`Cleanliness: ${house.cleanliness}%`);
    console.log(`Rooms: ${house.rooms.join(', ')}`);

    console.log('\n1. 🔧 Upgrade House');
    console.log('2. 🧹 Clean House');
    console.log('3. 🔙 Back');

    const choice = await this.getInput('\n👉 Choose an option (1-3): ');
    
    let result;
    switch (choice.trim()) {
      case '1':
        result = this.game.upgradeHouse();
        break;
      case '2':
        result = this.game.cleanHouse();
        break;
      case '3':
        return;
      default:
        console.log('❌ Invalid choice!');
        return;
    }

    console.log(`\n${result.success ? '✅' : '❌'} ${result.message}`);
  }

  async storyMode() {
    const storyData = this.game.enterStoryMode();
    
    console.log(`\n📖 Story Mode - Chapter ${storyData.chapter.title}`);
    console.log(storyData.chapter.description);

    if (storyData.quests.length === 0) {
      console.log('\n🎉 All quests in this chapter completed!');
      return;
    }

    console.log('\n📋 Available Quests:');
    storyData.quests.forEach((quest, index) => {
      console.log(`${index + 1}. ${quest.title}`);
      console.log(`   ${quest.description}`);
      console.log(`   Rewards: $${quest.rewards.money}, ${quest.rewards.experience} XP`);
    });
  }

  async helpNeighbors() {
    const helpOptions = this.game.getNeighborHelp();
    
    console.log('\n🤝 Neighbor Help Requests:');
    helpOptions.forEach((help, index) => {
      console.log(`${index + 1}. ${help.neighbor}: ${help.task} (Reward: $${help.reward})`);
    });

    const choice = await this.getInput('\n👉 Select a task (1-' + helpOptions.length + ') or 0 to cancel: ');
    const helpIndex = parseInt(choice) - 1;
    
    if (choice.trim() === '0') return;
    
    if (helpIndex < 0 || helpIndex >= helpOptions.length) {
      console.log('❌ Invalid task selection!');
      return;
    }

    const result = this.game.helpNeighbor(helpIndex);
    console.log(`\n✅ ${result.message}`);
  }

  async viewStatus() {
    const status = this.game.getGameStatus();
    
    console.log('\n📊 Player Status:');
    console.log('═'.repeat(40));
    console.log(`Name: ${status.player.name}`);
    console.log(`Level: ${status.player.level} (XP: ${status.player.experience})`);
    console.log(`Money: $${status.player.money}`);
    console.log(`Pets: ${status.player.pets.length}/${status.player.house.capacity}`);
    console.log(`House: Level ${status.player.house.level}`);
    console.log(`Story: Chapter ${status.currentChapter}`);
    console.log(`Achievements: ${status.player.achievements.join(', ') || 'None yet'}`);
  }

  async saveGame() {
    const result = this.game.saveGame();
    console.log(`\n${result.success ? '✅' : '❌'} ${result.message}`);
  }

  getInput(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Start the game
console.log('🎮 Starting PupPlay...');
const game = new PupPlayCLI();
game.start().catch(err => {
  console.error("❌ Game failed:", err);
  process.exit(1);
});
