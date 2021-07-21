'reach 0.1';

//#region Constants and Definitions

const GRAPH_SIZE = 10;

const [isTransition, RELOCATION, PURCHASE, PROCESSING ] = makeEnum(3);
const [isUnit, UNITS, KILOGRAMS, TONNES ] = makeEnum(3);

const [isState, PRODUCTION, STORAGE ] = makeEnum(2);
const [isSupply, LUMBER, CONCRETE, STEEL] = makeEnum(3);

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
        transitionsLength: UInt,
        transitions: Array(UInt, GRAPH_SIZE),
      }), GRAPH_SIZE),
    })], 

    // no parameters
    Null
  ),

  // Adds to the graph
  createTransaction: Fun(
    [], 
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
  }),

  // logging function
  log: Fun(true, Null),
};

// a null interface of the transition object
const NullTransition = {
  dope: 0
};

//#endregion

export const main = Reach.App(() => {
  const A = Participant('Alice', TransactorInterface);
  deploy();

  //#region Initial Node Retrieval

  // asks the frontend for the initial node response
  A.only(() => {
    const _initNodeResponse = interact.createChain;
    const initNode = {
      supplyName: _initNodeResponse.supplyName,
      stateName: _initNodeResponse.stateName,    
      inventoryUnit: _initNodeResponse.inventoryUnit,
      inventoryValue: _initNodeResponse.inventoryValue,
      date: _initNodeResponse.date,
      transitionsLength: 0,
      transitions: Array.replicate(GRAPH_SIZE, 0),
    };
  });
  A.publish(initNode);

  //#endregion

  //#region Infinite Chain Loop

  // short for "Chain State"
  var cs = {
    transitionsLength: 0,
    transitions: Array.replicate(GRAPH_SIZE, NullTransition),
    statesLength: 1,
    states: Array.replicate(GRAPH_SIZE, initNode)
  };

  invariant(
    cs.transitionsLength >= 0 && 
    cs.transitions.length == GRAPH_SIZE &&
    cs.statesLength >= 1 &&
    cs.states.length == GRAPH_SIZE &&
    cs.transitionsLength < cs.statesLength
  );

  // The chain stays as long as there aren't too many states.
  while(cs.statesLength < 100) {
    commit();

    A.only(() => {
      const nextTransaction = declassify(interact.createTransaction());
    });
    A.publish(nextTransaction);

    // TODO: add to transitions & states based off of what was given in nextTransaction

    const newCS = {
      transitionsLength: cs.transitionsLength + 1,
      transitions: cs.transitions,
      statesLength: cs.statesLength + 1,
      states: cs.states
    };
    cs = newCS;
    continue;
  }

  transfer(balance()).to(A);
  commit();

  //#endregion

  exit();
});
