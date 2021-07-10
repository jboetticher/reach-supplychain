import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
  const stdlib = await loadStdlib(process.env);
  const startingBalance = stdlib.parseCurrency(100);

  const alice = await stdlib.newTestAccount(startingBalance);

  const ctcAlice = alice.deploy(backend);

  let chainIndex = 0;
  let additionalNodes = [
    {
      origin: 0,
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
      origin: 1,
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
      origin: 2,
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


    }),
  ]);

  console.log('Hello, Alice and Bob!');
})();
