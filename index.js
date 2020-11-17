var inquirer = require('inquirer');
let literallyEverthing = {};

// inquirer
//   .prompt([
//     /* Pass your questions in here */
//   ])
//   .then(answers => {
//     // Use user feedback for... whatever!!
//   })
//   .catch(error => {
//     if(error.isTtyError) {
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       // Something else when wrong
//     }
//   });
// Game starts look left, right, up, or down.

// Should every collactable have specific display text for each object
const inputQuestion = {
  type: 'input',
  name: 'res',
  message: '',
  filter: function (val) {
    return val.toLowerCase();
  },
}

const collactables = [
  {
    name: 'key'
  }
]
const inventory = [];

literallyEverthing = {
  right: {
    displayText: 'You are looking at a desk you see a picture frame on it and some drawers.',
    goBack: () => { main() },
    inspects: [{
      name: 'frame',
      displayText: 'the picture of a man and what appears to be their daughter. but wait the back of the picture frame seems to be loose.',
      goBack: () => { main(literallyEverthing.right) },
      inspects: [{
        name: 'frame',
        displayText: 'You found a key!',
        addToInventory: () => { inventory.push(collactables.find(item => item.name == 'key')) },
        goBack: () => { main(literallyEverthing.right) },
      }]
    }, {
      name: 'drawer',
      goBack: () => { main(literallyEverthing.right) },
      displayText: 'The drawers appear to be locked',
      // We could have a bool here so the user doesnt need to keep saying use item everytime
      useables: [{
        name: 'key',
        goBack: () => { main(literallyEverthing.right) },
        displayText: 'you unlocked the drawer. You found a note, that says April 4th 95',
      }]
    }],
   },
  left: {
    displayText: 'You see a door thats locked using a dial combo padlock.',
    goBack: () => { main() },
    inspects: [{
      name: 'lock',
      question: {
        type: 'input',
        name: 'res',
        gameWinning: true,
        message: `Appears to be a standard dial combo padlock. You try to enter in some numbers. The combo is in dd-dd-dd format.`,
      },
      goBack: () => { main(literallyEverthing.left) },
      validate: (result) => { 
        if (result.res == '04-04-95') {
          console.log('You won mother fucker!!!');
          return;
        } else {
          console.log('That combo did not appear to work.');
          const padlock = literallyEverthing.left.inspects.find(ins => ins.name == 'lock');
          main(padlock);
          return;
        }
       },
    }]
  }
};

async function main(action = null) {
  if (action) {
    let result;
    if (!action.displayText) {
      result = await inquirer.prompt(action.question);

      if (result.res == 'back') {
        main(literallyEverthing.left);
        return;
      }

      action.validate(result);

      // Do something here for anyother time the user has
      return;

    } else {
      inputQuestion.message = action.displayText;
      result  = await inquirer.prompt(inputQuestion);
    }
    const { res } = result;

    if (res.indexOf('inspect') != -1) {
      const inspectedItem = action.inspects.find(inspected => {
        return res.indexOf(inspected.name) != -1;
      });

      if (!inspectedItem) {
        console.log("Sorry I don't know what you're trying to inspect.");
        main(action);
        return;
      }

      if (inspectedItem.hasOwnProperty('addToInventory'))
        inspectedItem.addToInventory();

      main(inspectedItem);
      return;

    } else if (res.indexOf('use') != -1) {
      if (!action.useables || action.useables.length == 0) {
        console.log(`Bro what you trying to do you can't use anything here.`);
        main(action);
        return;
      }
      if (inventory.length == 0) {
        console.log(`You don't have anything in your inventory you fool.`);
        main(action);
        return;
      }
      // Check your inventory for something they want to use
      const itemUsed = inventory.find((inv) => {
        return res.indexOf(inv.name) != -1;
      });

      // If the user said soem dumb shit thats not in their inventory
      if (!itemUsed) {
        console.log(`I don't know what the hell you trying to do but you don't have that in your inventory.`);
        main(action);
        return;
      }

      // Can they use that item here?
      const youCanUse = action.useables.find((thingsToUse) => {
        return thingsToUse.name == itemUsed.name;
      });

      if (youCanUse) {
        main(youCanUse);
        return;
      } else {
        console.log(`You can't use ${itemUsed.name} here you fool.`);
        main(action);
      }
      
    } else if (res.indexOf('back') != -1) {
      console.log('8');
      action.goBack();
      return;
    }
  } else {
    const res = await inquirer.prompt(
      {
        type: 'list',
        name: 'direction',
        message: `You're in some bullshit look left, right, up or down.`,
        choices: ['Right', 'Left', 'Up', 'Down'],
        filter: function (val) {
          return val.toLowerCase();
        },
      }
    );
    console.log(res.direction);
    if (res.direction.indexOf('right') != -1)
      main(literallyEverthing.right);
    
    if (res.direction.indexOf('left') != -1)
      main(literallyEverthing.left);
    
    if (res.direction.indexOf('down') != -1)
      main(literallyEverthing.down);

    if (res.direction.indexOf('up') != -1)
      main(literallyEverthing.up);
  }
}

main();

