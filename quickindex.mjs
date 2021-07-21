import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
  const stdlib = await loadStdlib(process.env);
  const startingBalance = stdlib.parseCurrency(100);

  const alice = await stdlib.newTestAccount(startingBalance);

  const ctcAlice = alice.deploy(backend);

  let chainIndex = 1;
  let additionalNodes = [
    {
      transition: {
        transitionName: 0,
        inventoryUnit: 1,
        inventoryValue: 100,
        date: 10000
      },
      state: {
        supplyName: 1,
        stateName: 1,
        inventoryUnit: 1,
        inventoryValue: 100,
        date: 10001
      }
    },
    {
      transition: {
        transitionName: 1,
        inventoryUnit: 1,
        inventoryValue: 50,
        date: 10000
      },
      state: {
        supplyName: 1,
        stateName: 1,
        inventoryUnit: 1,
        inventoryValue: 50,
        date: 10001
      }
    },
    {
      transition: {
        transitionName: 0,
        inventoryUnit: 1,
        inventoryValue: 25,
        date: 10000
      },
      state: {
        supplyName: 1,
        stateName: 1,
        inventoryUnit: 1,
        inventoryValue: 25,
        date: 10001
      }
    }
  ];

  await Promise.all([
    backend.Alice(ctcAlice, {
      ...stdlib.hasRandom,

      createChain: additionalNodes[0].state,
      createTransaction: function() {
        let index = additionalNodes[chainIndex];
        chainIndex += 1;
        return index;
      },
      viewData: function(data) {
        let cIndx = data.chainState;

        console.log(`Chain State: ${cIndx}`);
        console.log("*** State: ***");
        console.log(`Supply: ${data.states[cIndx].supplyName}, State: ${data.states[cIndx].stateName}`); 
        console.log(`Inventory Unit: ${data.states[cIndx].inventoryUnit}, Inventory Value: ${data.states[cIndx].inventoryValue}`);
        console.log(`Date: ${data.states[cIndx].date}`);
        console.log("-------------------------------------------------------");
      }
    }),
  ]);

  console.log('Supply chain ended.');
})();