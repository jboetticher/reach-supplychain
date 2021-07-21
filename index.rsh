'reach 0.1';

/**
 * This document has had its logic simplified significantly so as to get a "working product."
 * This was done because there was limited time in the Monash hackathon, and an error with
 * Reach compilation.
 * 
 * There is a hard-coded maximum of 3 nodes.
 * There is no support for future multiple transitions (locked linearly).
 * 
 * If you would like to see what a proper implementation is like, please switch to the main
 * branch. Do be warned, at the time of writing the Reach compiler I'm using encounters an issue, 
 * which is sure to be fixed in a different version of Reach. However, for the sake of time, this
 * branch was made.
 */

//#region Constants and Definitions

const GRAPH_SIZE = 3;

const [isTransition, RELOCATION, PURCHASE, PROCESSING ] = makeEnum(3);
const [isUnit, UNITS, KILOGRAMS, TONNES ] = makeEnum(3);

const [isState, PRODUCTION, STORAGE, USAGE ] = makeEnum(3);
const [isSupply, LUMBER, CONCRETE, STEEL] = makeEnum(3);

const TransactorInterface = {
  // Returns all the data in the graph
  viewData: Fun([
    Object({ 
      chainState: UInt,

      transitions: Array(Object({
        transitionName: UInt, // isTransition
        inventoryUnit: UInt,  // isUnit
        inventoryValue: UInt,
        date: UInt,
      }), GRAPH_SIZE - 1),
      
      states: Array(Object({
        supplyName: UInt,     // isSupply
        stateName: UInt,      // isTransition
        inventoryUnit: UInt,  // isUnit
        inventoryValue: UInt,
        date: UInt,
      }), GRAPH_SIZE),
    })], 

    // no parameters
    Null
  ),

  // Adds to the graph
  createTransaction: Fun(
    [], 
    Object({ 
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
    };
  });
  A.publish(initNode);

  //#endregion

  
  //#region Linear Supply Chain

  /**
   * NOTE:
   * The infinite chain loop has been removed in this branch, because there is no point if there
   * is no easy extension of the graph size. The graph size is now 3, and will remain 3.
   */ 

  const cs1 = {
    chainState: 0,
    transitions: array(Object({ transitionName: UInt, inventoryUnit: UInt, inventoryValue: UInt, date: UInt }), [ 
      {
        transitionName: 0, // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      },
      {
        transitionName: 0, // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      },
    ]),
    states: array(Object({ supplyName: UInt, stateName: UInt, inventoryUnit: UInt, inventoryValue: UInt, date: UInt }), [
      initNode,
      {
        supplyName: 0,     // isSupply
        stateName: 0,      // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      },
      {
        supplyName: 0,     // isSupply
        stateName: 0,      // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      }
    ])
  };

  A.only(() => {
    interact.viewData(cs1);
    const transReq1 = declassify(interact.createTransaction());
  });
  commit();

  A.publish(transReq1);
  const cs2 = {
    chainState: 1,
    transitions: array(Object({ transitionName: UInt, inventoryUnit: UInt, inventoryValue: UInt, date: UInt }), [ 
      transReq1.transition,
      {
        transitionName: 0, // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      },
    ]),
    states: array(Object({ supplyName: UInt, stateName: UInt, inventoryUnit: UInt, inventoryValue: UInt, date: UInt }), [
      initNode,
      transReq1.state,
      {
        supplyName: 0,     // isSupply
        stateName: 0,      // isTransition
        inventoryUnit: 0,  // isUnit
        inventoryValue: 0,
        date: 0,
      }
    ])
  };

  A.only(() => {
    interact.viewData(cs2);
    const transReq2 = declassify(interact.createTransaction());
  });
  commit();

  A.publish(transReq2);
  const cs3 = {
    chainState: 2,
    transitions: array(Object({ transitionName: UInt, inventoryUnit: UInt, inventoryValue: UInt, date: UInt }), [ 
      transReq1.transition,
      transReq2.transition,
    ]),
    states: array(Object({ supplyName: UInt, stateName: UInt, inventoryUnit: UInt, inventoryValue: UInt, date: UInt }), [
      initNode,
      transReq1.state,
      transReq2.state
    ])
  };

  A.only(() => {
    interact.viewData(cs3);
  })

  //#endregion

  commit();
  exit();
});
