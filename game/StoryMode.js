export class StoryMode {
  constructor() {
    this.chapters = this.initializeChapters();
    this.currentChapter = 1;
  }

  initializeChapters() {
    return {
      1: {
        title: "Welcome to PupPlay!",
        description: "You've just inherited a small house and want to start caring for pets. Learn the basics of pet care.",
        quests: [
          {
            id: "first_pet",
            title: "Adopt Your First Pet",
            description: "Visit the pet shop and adopt your first companion.",
            requirements: { pets: 1 },
            rewards: { money: 100, experience: 50 },
            completed: false
          },
          {
            id: "basic_care",
            title: "Pet Care Basics",
            description: "Feed, play with, and clean your pet to keep them happy.",
            requirements: { care_actions: 5 },
            rewards: { money: 75, experience: 30 },
            completed: false
          }
        ],
        unlocks: ['pet_shop_expanded']
      },
      2: {
        title: "Growing Family",
        description: "Your pet care skills are improving. Time to expand your family and upgrade your home.",
        quests: [
          {
            id: "second_pet",
            title: "Adopt a Second Pet",
            description: "Your first pet could use a friend. Adopt another pet.",
            requirements: { pets: 2 },
            rewards: { money: 150, experience: 75 },
            completed: false
          },
          {
            id: "house_upgrade",
            title: "Home Improvement",
            description: "Upgrade your house to accommodate more pets.",
            requirements: { house_level: 2 },
            rewards: { money: 200, experience: 100 },
            completed: false
          }
        ],
        unlocks: ['advanced_pets', 'decorations']
      },
      3: {
        title: "Pet Expert",
        description: "You're becoming a skilled pet caretaker. Learn advanced techniques and help others.",
        quests: [
          {
            id: "pet_master",
            title: "Raise a Pet to Level 5",
            description: "Show your expertise by raising a pet to level 5.",
            requirements: { max_pet_level: 5 },
            rewards: { money: 300, experience: 150 },
            completed: false
          },
          {
            id: "helper",
            title: "Help a Neighbor",
            description: "The AI neighbors need help with their pets. Lend a hand.",
            requirements: { help_actions: 3 },
            rewards: { money: 250, experience: 120 },
            completed: false
          }
        ],
        unlocks: ['rare_pets', 'breeding']
      },
      4: {
        title: "Community Leader",
        description: "You've become a pillar of the pet community. Lead by example and discover rare species.",
        quests: [
          {
            id: "rare_collector",
            title: "Collect Rare Pets",
            description: "Discover and adopt pets with rare traits.",
            requirements: { rare_pets: 2 },
            rewards: { money: 500, experience: 200 },
            completed: false
          },
          {
            id: "mansion_owner",
            title: "Build a Pet Mansion",
            description: "Upgrade your house to the maximum level.",
            requirements: { house_level: 5 },
            rewards: { money: 1000, experience: 300 },
            completed: false
          }
        ],
        unlocks: ['exotic_pets', 'competitions']
      }
    };
  }

  getCurrentChapter() {
    return this.chapters[this.currentChapter];
  }

  checkQuestProgress(player) {
    const chapter = this.getCurrentChapter();
    const results = [];

    for (const quest of chapter.quests) {
      if (quest.completed) continue;

      let completed = false;

      // Check quest requirements
      switch (true) {
        case quest.requirements.pets && player.pets.length >= quest.requirements.pets:
          completed = true;
          break;
        case quest.requirements.house_level && player.house.level >= quest.requirements.house_level:
          completed = true;
          break;
        case quest.requirements.max_pet_level:
          const maxLevel = Math.max(...player.pets.map(p => p.level), 0);
          completed = maxLevel >= quest.requirements.max_pet_level;
          break;
        case quest.requirements.care_actions:
          // This would be tracked separately in a real implementation
          completed = player.pets.reduce((sum, pet) => sum + pet.level, 0) >= quest.requirements.care_actions;
          break;
        case quest.requirements.help_actions:
          // Simulated for now
          completed = player.achievements.includes('helper');
          break;
        case quest.requirements.rare_pets:
          const rarePets = player.pets.filter(p => p.traits && p.traits.includes('rare')).length;
          completed = rarePets >= quest.requirements.rare_pets;
          break;
      }

      if (completed && !quest.completed) {
        quest.completed = true;
        player.earnMoney(quest.rewards.money, `quest: ${quest.title}`);
        player.addExperience(quest.rewards.experience);
        results.push(`🎯 Quest completed: "${quest.title}"! Rewards claimed!`);
        
        // Unlock content
        if (chapter.unlocks) {
          player.storyProgress.unlockedContent.push(...chapter.unlocks);
        }
      }
    }

    // Check if chapter is complete
    const allQuestsComplete = chapter.quests.every(q => q.completed);
    if (allQuestsComplete && this.currentChapter < Object.keys(this.chapters).length) {
      this.currentChapter++;
      player.storyProgress.currentChapter = this.currentChapter;
      results.push(`📖 Chapter ${this.currentChapter - 1} completed! Chapter ${this.currentChapter} unlocked!`);
    }

    return results;
  }

  getAvailableQuests() {
    const chapter = this.getCurrentChapter();
    return chapter.quests.filter(q => !q.completed);
  }

  getAllQuests() {
    const chapter = this.getCurrentChapter();
    return chapter.quests;
  }

  // AI-driven story interactions
  getRandomStoryEvent(player) {
    const events = [
      {
        title: "Mysterious Pet Visitor",
        description: "A strange pet appears at your door, looking hungry and tired.",
        choices: [
          { text: "Feed the pet", outcome: "earn_karma", reward: "Good deed increases your reputation!" },
          { text: "Ignore it", outcome: "neutral", reward: "The pet wanders away..." }
        ]
      },
      {
        title: "Pet Supply Sale",
        description: "The local pet shop is having a 50% off sale on supplies!",
        choices: [
          { text: "Stock up on supplies", outcome: "discount_shopping", reward: "Great deals on pet supplies!" },
          { text: "Save money", outcome: "frugal", reward: "You keep your money for later." }
        ]
      },
      {
        title: "Neighborhood Pet Show",
        description: "There's a pet show in town. Your pets could compete!",
        choices: [
          { text: "Enter your best pet", outcome: "competition", reward: "Win or lose, it's great experience!" },
          { text: "Just watch", outcome: "observer", reward: "You learn new pet care techniques by watching." }
        ]
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  processStoryChoice(choice, player) {
    switch (choice.outcome) {
      case "earn_karma":
        player.achievements.push("good_samaritan");
        return player.earnMoney(50, "good deed");
      case "discount_shopping":
        player.inventory.food += 10;
        player.inventory.toys += 5;
        return "Stocked up on supplies at great prices!";
      case "competition":
        const prize = Math.random() > 0.5 ? 200 : 50;
        return player.earnMoney(prize, "pet competition");
      case "observer":
        return player.addExperience(25) || "Learned new techniques by observing!";
      default:
        return choice.reward;
    }
  }
}