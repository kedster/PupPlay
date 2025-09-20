// PupPlay Web Interface JavaScript

let currentPlayer = null;
let gameData = {
    playerName: '',
    money: 500,
    level: 1,
    pets: [],
    house: { level: 1, capacity: 3 }
};

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    // New game form handler
    document.getElementById('new-game-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const playerName = document.getElementById('player-name').value.trim();
        if (playerName) {
            startNewGame(playerName);
        }
    });
});

function startNewGame(playerName) {
    gameData.playerName = playerName;
    updatePlayerDisplay();
    showScreen('game-demo');
    
    // Show welcome message
    showActionResult(`Welcome to PupPlay, ${playerName}! Your virtual pet adventure begins now.`);
}

function updatePlayerDisplay() {
    document.getElementById('player-name-display').textContent = gameData.playerName;
    document.getElementById('player-money').textContent = `$${gameData.money}`;
    document.getElementById('player-level').textContent = gameData.level;
    updatePetsList();
}

function updatePetsList() {
    const petsList = document.getElementById('pets-list');
    
    if (gameData.pets.length === 0) {
        petsList.innerHTML = '<p class="empty-state">No pets yet! Visit the pet shop to adopt your first companion.</p>';
    } else {
        let petsHTML = '';
        gameData.pets.forEach((pet, index) => {
            petsHTML += `
                <div class="pet-item">
                    <span class="pet-name">${pet.name} the ${pet.species}</span>
                    <small>Level ${pet.level} • ${pet.breed}</small>
                    <div class="pet-stats">
                        😊 ${pet.happiness}% | ⚡ ${pet.energy}% | 🍽️ ${100-pet.hunger}%
                    </div>
                </div>
            `;
        });
        petsList.innerHTML = petsHTML;
    }
}

function simulateAction(action) {
    let message = '';
    let success = true;
    
    switch (action) {
        case 'shop':
            message = simulatePetShop();
            break;
        case 'house':
            message = simulateHouseAction();
            break;
        case 'story':
            message = simulateStoryMode();
            break;
        case 'help':
            message = simulateNeighborHelp();
            break;
        default:
            message = 'Unknown action!';
            success = false;
    }
    
    showActionResult(message, success);
}

function simulatePetShop() {
    const petTypes = [
        { name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', price: 120 },
        { name: 'Whiskers', species: 'Cat', breed: 'Persian', price: 90 },
        { name: 'Tweety', species: 'Bird', breed: 'Canary', price: 65 }
    ];
    
    const randomPet = petTypes[Math.floor(Math.random() * petTypes.length)];
    
    if (gameData.money >= randomPet.price && gameData.pets.length < gameData.house.capacity) {
        gameData.money -= randomPet.price;
        gameData.pets.push({
            name: randomPet.name,
            species: randomPet.species,
            breed: randomPet.breed,
            level: 1,
            happiness: 50,
            hunger: 30,
            energy: 70,
            experience: 0
        });
        updatePlayerDisplay();
        return `🎉 Adopted ${randomPet.name} the ${randomPet.breed} ${randomPet.species} for $${randomPet.price}! Welcome to the family!`;
    } else if (gameData.money < randomPet.price) {
        return `❌ Not enough money to adopt ${randomPet.name}! Need $${randomPet.price}, have $${gameData.money}`;
    } else {
        return `❌ House is full! Current capacity: ${gameData.house.capacity} pets. Upgrade your house first!`;
    }
}

function simulateHouseAction() {
    const upgradeCost = gameData.house.level * 200;
    
    if (gameData.money >= upgradeCost) {
        gameData.money -= upgradeCost;
        gameData.house.level++;
        gameData.house.capacity += 2;
        updatePlayerDisplay();
        return `🏠 House upgraded to level ${gameData.house.level}! Capacity increased to ${gameData.house.capacity} pets. Cost: $${upgradeCost}`;
    } else {
        return `❌ Not enough money for house upgrade! Need $${upgradeCost}, have $${gameData.money}`;
    }
}

function simulateStoryMode() {
    const storyEvents = [
        {
            title: "First Steps",
            description: "You're learning the basics of pet care. Keep up the good work!",
            reward: 50
        },
        {
            title: "Mysterious Visitor",
            description: "A friendly neighbor gives you supplies for your pets!",
            reward: 75
        },
        {
            title: "Pet Show Opportunity",
            description: "There's a local pet show coming up. Your pets could participate!",
            reward: 100
        }
    ];
    
    const randomEvent = storyEvents[Math.floor(Math.random() * storyEvents.length)];
    gameData.money += randomEvent.reward;
    updatePlayerDisplay();
    
    return `📖 Story Event: "${randomEvent.title}" - ${randomEvent.description} Earned $${randomEvent.reward}!`;
}

function simulateNeighborHelp() {
    const helpTasks = [
        { neighbor: 'Sarah', task: 'walked her dog', reward: 50 },
        { neighbor: 'Mike', task: 'fed his cats', reward: 40 },
        { neighbor: 'Elena', task: 'cleaned bird cage', reward: 60 }
    ];
    
    const randomTask = helpTasks[Math.floor(Math.random() * helpTasks.length)];
    gameData.money += randomTask.reward;
    
    // Small chance to level up
    if (Math.random() < 0.3) {
        gameData.level++;
    }
    
    updatePlayerDisplay();
    
    return `🤝 Helped ${randomTask.neighbor} and ${randomTask.task}! Earned $${randomTask.reward} and gained experience!`;
}

function showActionResult(message, success = true) {
    const resultDiv = document.getElementById('action-result');
    resultDiv.innerHTML = `<p>${success ? '✅' : '❌'} ${message}</p>`;
    resultDiv.className = `result-display show ${success ? 'success' : 'error'}`;
    
    // Hide after 5 seconds
    setTimeout(() => {
        resultDiv.classList.remove('show');
    }, 5000);
}

// Simulate some pet interactions
function petInteraction() {
    if (gameData.pets.length === 0) return;
    
    const randomPet = gameData.pets[Math.floor(Math.random() * gameData.pets.length)];
    const interactions = [
        `${randomPet.name} wags tail happily!`,
        `${randomPet.name} makes a cute sound!`,
        `${randomPet.name} does a little trick!`,
        `${randomPet.name} nuzzles against you.`
    ];
    
    const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
    showActionResult(`🐾 ${randomInteraction}`, true);
}

// Auto-simulate pet interactions every 30 seconds
setInterval(() => {
    if (gameData.pets.length > 0 && Math.random() < 0.5) {
        petInteraction();
    }
}, 30000);

// Add CSS for pet items
const style = document.createElement('style');
style.textContent = `
    .pet-item {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
    }
    
    .pet-name {
        font-weight: 600;
        color: #667eea;
        display: block;
        margin-bottom: 5px;
    }
    
    .pet-stats {
        margin-top: 8px;
        font-size: 0.9rem;
        color: #666;
    }
    
    .result-display.success {
        background: #e8f5e8;
        border-color: #4caf50;
    }
    
    .result-display.error {
        background: #ffebee;
        border-color: #f44336;
    }
`;
document.head.appendChild(style);