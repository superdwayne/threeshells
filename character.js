// Get the character info element
const characterInfo = document.getElementById('character-info');

// Create an array of characters
const characters = [
  {
    name: 'Guile',
    image: 'https://example.com/guile.jpg'
  },
  {
    name: 'Ken Masters',
    image: 'https://example.com/kenMasters.jpg'
  },
  // Add more characters here...
];

// Function to display character info
function displayCharacterInfo() {
  const charList = document.createElement('ul');
  for (let i = 0; i < characters.length; i++) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<h2>${characters[i].name}</h2>
                          <img src="${characters[i].image}" alt="${characters[i].name} image">
                          `;
    charList.appendChild(listItem);
  }
  characterInfo.appendChild(charList);
}

// Call the function to display character info
displayCharacterInfo();