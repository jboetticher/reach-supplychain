'reach 0.1';

//#region Constants and Definitions

const GRAPH_SIZE = 100;

const [isTransition, RELOCATION, PURCHASE, PROCESSING ] = makeEnum(3);
const [isUnit, UNITS, KILOGRAMS, TONNES ] = makeEnum(3);

const [isState, PRODUCTION, STORAGE ] = makeEnum(2);
const [isSupply, LUMBER, CONCRETE, STEEL] = makeEnum(3);

//#endregion

const TransactorInterface = {
  // Returns all the data in the graph
  viewData: Fun([
    Object({ 
      transitionsLength: UInt, 
      transitions: Array(Object({
        transitionName: UInt, // isTransition
        inventoryUnit: UInt,  // isUnit
        inventoryValue: UInt,
        date: UInt,
        originTransition: UInt,
        endpoint: UInt,
      }), GRAPH_SIZE),
      
      statesLength: UInt,
      states: Array(Object({
        supplyName: UInt,     // isSupply
        stateName: UInt,      // isTransition
        inventoryUnit: UInt,  // isUnit
        inventoryValue: UInt,
        date: UInt,
        transitions: Array(UInt, GRAPH_SIZE),
      }), GRAPH_SIZE),
    })], 

    // no parameters
    Null
  ),

  // Adds to the graph
  createTransaction: Fun(
    [Bool], 
    Object({ 
      origin: UInt,
      transition: Object({
        transitionName: UInt, // isTransition
        inventoryUnit: UInt,  // isUnit
        inventoryValue: UInt,
        date: UInt,
      }),
      state: Object({
        supplyName: UInt,     // isSupply
        stateName: UInt,      // isTransition
        inventoryUnit: UInt,  // isUnit
        inventoryValue: UInt,
        date: UInt,
        transitions: Array(UInt, GRAPH_SIZE),
      })
    })
  ),

  // starts the chain
  createChain: Object({
    supplyName: UInt,     // isSupply
    stateName: UInt,      // isTransition
    inventoryUnit: UInt,  // isUnit
    inventoryValue: UInt,
    date: UInt,
  })
};

export const main = Reach.App(() => {
  const A = Participant('Alice', TransactorInterface);
  deploy();

  // write your program here
  /*
  A.only(() => {
    interact.createChain();
  });
  */

});
