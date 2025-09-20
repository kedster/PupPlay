import { GameEngine } from '../game/GameEngine.js';
import { Pet } from '../game/Pet.js';
import { Player } from '../game/Player.js';

class GameTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  assert(condition, message) {
    if (condition) {
      console.log(`✅ ${message}`);
      this.passed++;
    } else {
      console.log(`❌ ${message}`);
      this.failed++;
    }
    this.tests.push({ passed: condition, message });
  }

  async runAllTests() {
    console.log('\n🧪 Running PupPlay Game Tests...\n');

    await this.testPetCreation();
    await this.testPetCare();
    await this.testPlayerSystem();
    await this.testGameEngine();
    await this.testPetShop();
    await this.testStoryMode();
    await this.testSaveLoad();

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${(this.passed / (this.passed + this.failed) * 100).toFixed(1)}%`);

    if (this.failed === 0) {
      console.log('\n🎉 All tests passed! PupPlay is ready to play!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.');
    }

    return this.failed === 0;
  }

  async testPetCreation() {
    console.log('🐾 Testing Pet System...');
    
    const pet = new Pet('Buddy', 'Dog', 'Golden Retriever');
    this.assert(pet.name === 'Buddy', 'Pet name set correctly');
    this.assert(pet.species === 'Dog', 'Pet species set correctly');
    this.assert(pet.breed === 'Golden Retriever', 'Pet breed set correctly');
    this.assert(pet.level === 1, 'Pet starts at level 1');
    this.assert(pet.happiness >= 0 && pet.happiness <= 100, 'Pet happiness in valid range');
    
    const species = Pet.getSpecies();
    this.assert(species.length >= 6, 'Multiple pet species available');
    this.assert(species.some(s => s.name === 'Dog'), 'Dog species available');
    this.assert(species.some(s => s.name === 'Cat'), 'Cat species available');
  }

  async testPetCare() {
    console.log('🎯 Testing Pet Care Actions...');
    
    const pet = new Pet('Test Pet', 'Cat');
    const initialHunger = pet.hunger;
    const initialHappiness = pet.happiness;
    
    const feedResult = pet.feed();
    this.assert(typeof feedResult === 'string', 'Feed action returns message');
    this.assert(pet.hunger < initialHunger, 'Feeding reduces hunger');
    this.assert(pet.experience > 0, 'Pet gains experience from feeding');
    
    const playResult = pet.play();
    this.assert(typeof playResult === 'string', 'Play action returns message');
    this.assert(pet.happiness > initialHappiness, 'Playing increases happiness');
    
    const cleanResult = pet.clean();
    this.assert(typeof cleanResult === 'string', 'Clean action returns message');
    this.assert(pet.cleanliness === 100, 'Cleaning maxes out cleanliness');
    
    // Test AI interaction
    const interaction = pet.getRandomInteraction();
    this.assert(typeof interaction === 'string', 'AI interaction returns string');
    this.assert(interaction.includes(pet.name), 'AI interaction includes pet name');
  }

  async testPlayerSystem() {
    console.log('👤 Testing Player System...');
    
    const player = new Player('TestPlayer');
    this.assert(player.name === 'TestPlayer', 'Player name set correctly');
    this.assert(player.money === 500, 'Player starts with correct money');
    this.assert(player.level === 1, 'Player starts at level 1');
    this.assert(player.pets.length === 0, 'Player starts with no pets');
    this.assert(player.house.level === 1, 'Player house starts at level 1');
    
    // Test pet adoption
    const adoptResult = player.adoptPet('Dog', 'Buddy');
    this.assert(adoptResult.success === true, 'Pet adoption succeeds');
    this.assert(player.pets.length === 1, 'Pet added to player collection');
    this.assert(player.money < 500, 'Money deducted for pet adoption');
    
    // Test house upgrade
    const initialLevel = player.house.level;
    const upgradeResult = player.upgradeHouse();
    if (upgradeResult.success) {
      this.assert(player.house.level > initialLevel, 'House level increased');
      this.assert(player.house.capacity > 3, 'House capacity increased');
    } else {
      this.assert(player.money < 200, 'House upgrade failed due to insufficient funds');
    }
  }

  async testGameEngine() {
    console.log('🎮 Testing Game Engine...');
    
    const game = new GameEngine();
    this.assert(game.gameState === 'menu', 'Game starts in menu state');
    
    const newGameResult = game.newGame('TestPlayer');
    this.assert(typeof newGameResult === 'string', 'New game returns message');
    this.assert(game.gameState === 'playing', 'Game state changes to playing');
    this.assert(game.player !== null, 'Player created successfully');
    
    // Test pet actions
    game.player.adoptPet('Cat', 'Whiskers');
    const feedResult = game.feedPet(0);
    this.assert(feedResult.success === true, 'Feed pet action works');
    
    const playResult = game.playWithPet(0);
    this.assert(playResult.success === true, 'Play with pet action works');
    
    // Test game status
    const status = game.getGameStatus();
    this.assert(status.player.name === 'TestPlayer', 'Game status returns player info');
    this.assert(status.player.pets.length >= 1, 'Game status shows pets');
  }

  async testPetShop() {
    console.log('🏪 Testing Pet Shop...');
    
    const game = new GameEngine();
    game.newGame('ShopTester');
    
    const shopData = game.visitShop();
    this.assert(shopData.pets.length > 0, 'Pet shop has pets available');
    this.assert(shopData.supplies.length > 0, 'Pet shop has supplies available');
    this.assert(shopData.playerMoney === game.player.money, 'Shop displays correct player money');
    
    // Test pet purchase
    if (game.player.money >= shopData.pets[0].price) {
      const purchaseResult = game.purchasePet(0, 'ShopPet');
      this.assert(purchaseResult.success === true, 'Pet purchase succeeds');
    } else {
      this.assert(true, 'Pet purchase test skipped (insufficient funds)');
    }
  }

  async testStoryMode() {
    console.log('📖 Testing Story Mode...');
    
    const game = new GameEngine();
    game.newGame('StoryTester');
    
    const storyData = game.enterStoryMode();
    this.assert(storyData.chapter !== undefined, 'Story mode has chapters');
    this.assert(storyData.quests !== undefined, 'Story mode has quests');
    this.assert(Array.isArray(storyData.quests), 'Quests is an array');
    this.assert(storyData.chapter.title !== undefined, 'Chapter has title');
    
    // Test neighbor help
    const helpOptions = game.getNeighborHelp();
    this.assert(Array.isArray(helpOptions), 'Neighbor help options available');
    this.assert(helpOptions.length > 0, 'Has help options available');
  }

  async testSaveLoad() {
    console.log('💾 Testing Save/Load System...');
    
    const game = new GameEngine();
    game.newGame('SaveTester');
    game.player.adoptPet('Bird', 'Tweety');
    game.player.earnMoney(100, 'test');
    
    const saveResult = game.saveGame();
    this.assert(saveResult.success === true, 'Game saves successfully');
    
    // Test loading
    const loadResult = game.loadGame('SaveTester');
    this.assert(loadResult.success === true, 'Game loads successfully');
    this.assert(game.player.name === 'SaveTester', 'Loaded player has correct name');
    this.assert(game.player.pets.length === 1, 'Loaded player has saved pets');
    this.assert(game.player.pets[0].name === 'Tweety', 'Pet data loaded correctly');
  }
}

// Run the tests
const tester = new GameTest();
tester.runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});